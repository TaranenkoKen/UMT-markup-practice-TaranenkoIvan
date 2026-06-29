import { apiClient } from './apiClient.js';
import { extractErrorMessage } from './utils.js';
import {
	showErrorNotification,
	showSuccessNotification,
} from './notifications.js';

const bouqetCards = document.querySelectorAll('.bouquet-card');
const detailModal = document.getElementById('detail-modal');
const closeBtns = document.querySelectorAll('#modal-close-button');
const detailModalContent = document.getElementById('detail-modal-content');
const orderModal = document.getElementById('order-modal');
const orderButtons = document.querySelectorAll('#order-form-button');
const orderModalForm = document.getElementById('order-modal-form');
const orderSubmitButton = orderModalForm?.querySelector('.order-modal-cta');

const orderSubmitDefaultLabel = 'Go to Checkout';
const orderSubmitLoadingLabel = 'Processing...';

let isOrderSubmitting = false;
let selectedProductId = null;
let selectedQuantity = 1;

function syncModalOpenState() {
	const anyModalOpen =
		detailModal.classList.contains('is-open') ||
		orderModal.classList.contains('is-open');

	document.body.classList.toggle('modal-open', anyModalOpen);
	document.documentElement.classList.toggle('modal-open', anyModalOpen);
}

function openDetailModal() {
	detailModal.classList.add('is-open');
	syncModalOpenState();
}

function openOrderModal() {
	orderModal.classList.add('is-open');
	syncModalOpenState();
}

function closeDetailModal() {
	detailModal.classList.remove('is-open');
	syncModalOpenState();
}

function closeOrderModal() {
	orderModal.classList.remove('is-open');
	syncModalOpenState();
	selectedProductId = null;
	selectedQuantity = 1;
	orderModalForm?.reset();
}

function setOrderSubmitLoading(isLoading) {
	if (!orderSubmitButton) {
		return;
	}

	orderSubmitButton.disabled = isLoading;
	orderSubmitButton.classList.toggle('is-loading', isLoading);
	orderSubmitButton.textContent = isLoading
		? orderSubmitLoadingLabel
		: orderSubmitDefaultLabel;
}

function buildDetailModalMarkup() {
	const markup = `
	<img class="detail-modal-image" alt="" />
	<div class="detail-modal-info">
		<h3 class="detail-modal-title"></h3>
		<p class="detail-modal-price"></p>
		<p class="detail-modal-text"></p>
		<div class="detail-modal-actions">
			<button type="button" class="detail-modal-button primary-button" id="detail-modal-cta">
				Buy now
			</button>
			<input
				type="number"
				min="1"
				value="1"
				class="detail-modal-quantity"
			/>
		</div>
	</div>
`;

	return markup;
}

function openDetailModalwithData(parentItem) {
	const title = parentItem.querySelector('h3').textContent;
	const price = parentItem.querySelector('.price').textContent;
	const text = parentItem.querySelector('p:not(.price)').textContent;
	const imgEl = parentItem.querySelector('img');
	const src = imgEl.getAttribute('src');
	const rawSrcset = imgEl.getAttribute('srcset');
	const alt = imgEl.getAttribute('alt');

	selectedProductId = parseInt(parentItem.dataset.productId, 10);

	detailModalContent.replaceChildren();
	detailModalContent.insertAdjacentHTML('beforeend', buildDetailModalMarkup());

	const detailImage = detailModalContent.querySelector('.detail-modal-image');
	detailImage.src = src;
	if (rawSrcset) {
		detailImage.setAttribute('srcset', rawSrcset);
	}
	detailImage.alt = alt;

	detailModalContent.querySelector('.detail-modal-title').textContent = title;
	detailModalContent.querySelector('.detail-modal-price').textContent = price;
	detailModalContent.querySelector('.detail-modal-text').textContent = text;

	openDetailModal();
}

document.addEventListener('click', (e) => {
	const parentItem = e.target.closest('.bouquet-card');
	if (!parentItem) return;

	openDetailModalwithData(parentItem);
});

closeBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		closeDetailModal();
		closeOrderModal();
	});
});

detailModal.addEventListener('click', (e) => {
	if (e.target === detailModal) {
		closeDetailModal();
	}
});

orderModal.addEventListener('click', (e) => {
	if (e.target === orderModal) {
		closeOrderModal();
	}
});

document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		closeDetailModal();
		closeOrderModal();
	}
});

detailModalContent.addEventListener('click', (e) => {
	if (
		e.target.id === 'detail-modal-cta' ||
		e.target.closest('#detail-modal-cta')
	) {
		const quantityInput = detailModalContent.querySelector(
			'.detail-modal-quantity',
		);
		if (quantityInput) {
			selectedQuantity = parseInt(quantityInput.value, 10) || 1;
		}
		closeDetailModal();
		openOrderModal();
	}
});

orderModalForm?.addEventListener('submit', async (e) => {
	e.preventDefault();

	if (isOrderSubmitting || orderModalForm.dataset.submitting === 'true') {
		return;
	}

	isOrderSubmitting = true;
	orderModalForm.dataset.submitting = 'true';

	const formData = new FormData(e.currentTarget);
	const payload = Object.fromEntries(formData.entries());

	setOrderSubmitLoading(true);

	try {
		await apiClient.post('/order', {
			name: payload.name,
			phone: payload.phone,
			address: payload.address,
			message: payload.message ?? '',
			productId: selectedProductId,
			quantity: selectedQuantity,
		});

		showSuccessNotification(
			`Thanks, ${payload.name}! We will call you at ${payload.phone}.`,
		);
		orderModalForm?.reset();
		closeOrderModal();
	} catch (error) {
		const message = extractErrorMessage(
			error,

			'Order failed. Please try again later.',
		);
		if (message) {
			showErrorNotification(message);
		}
	} finally {
		isOrderSubmitting = false;
		delete orderModalForm.dataset.submitting;
		setOrderSubmitLoading(false);
	}
});
