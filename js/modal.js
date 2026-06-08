const bouqetCards = document.querySelectorAll('.bouquet-card');
const detailModal = document.getElementById('detail-modal');
const closeBtns = document.querySelectorAll('#modal-close-button');
const detailModalContent = document.getElementById('detail-modal-content');
const orderModal = document.getElementById('order-modal');
const orderButtons = document.querySelectorAll('#order-form-button');
const orderModalForm = document.getElementById('order-modal-form');

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
		closeDetailModal();
		openOrderModal();
	}
});

orderModalForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const formData = new FormData(e.currentTarget);

	const data = Object.fromEntries(formData.entries());

	console.log('name', data.name);

	alert(`Thank you for your order, ${data.name}!`);

	e.currentTarget.reset();
	closeOrderModal();
});
