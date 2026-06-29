import { apiClient } from './apiClient';
import { showErrorNotification } from './notifications';
import { extractErrorMessage } from './utils';

const itemsPerPage = 8;
const showMoreButtonDefaultLabel = 'Show More';
const showMoreButtonLoadingLabel = 'Loading...';

const bouquetsList = document.getElementById('bouquets-list');
const bouquetsListShell = document.querySelector('.bouquets-list-shell');
const bouquetsLoader = document.getElementById('bouquets-loader');
const showMoreButton = document.querySelector('.show-more-button');

let lastLoadedPage = 0;

function formatPriceUsd(price) {
	if (price === null || price === undefined || price === '') {
		return '—';
	}
	const numericValue =
		typeof price === 'number'
			? price
			: Number.parseFloat(
					String(price)
						.replace(/[^0-9.,-]/g, '')
						.replace(',', '.'),
				);
	if (Number.isNaN(numericValue)) {
		return String(price);
	}
	return `$${numericValue}`;
}

function buildBouquetsListItemShellMarkup() {
	return `
	<li class="bouquets-list-item bouquet-card">
        <img class="bouquets-list-image" alt="">
        <h3 class="section-subtitle bouquets-list-title"></h3>
        <p class="section-subdescription bouquets-list-description"></p>
        <p class="price"></p>
    </li>`;
}

function fillBouquetsListItem(listItem, product) {
	const image = listItem.querySelector('.bouquets-list-image');
	image.src = product.img;
	image.alt = product.title;
	listItem.querySelector('.bouquets-list-title').textContent = product.title;
	listItem.querySelector('.bouquets-list-description').textContent =
		product.desc;
	listItem.querySelector('.price').textContent = formatPriceUsd(product.price);
	listItem.dataset.productId = product.id;
}

function setShowMoreButtonLoading(isLoading) {
	if (!showMoreButton) {
		return;
	}

	showMoreButton.disabled = isLoading;
	showMoreButton.classList.toggle('is-loading', isLoading);
	showMoreButton.textContent = isLoading
		? showMoreButtonLoadingLabel
		: showMoreButtonDefaultLabel;
}

function setBouquetsInitialLoading(isLoading) {
	if (bouquetsLoader) bouquetsLoader.hidden = !isLoading;
	if (bouquetsListShell)
		bouquetsListShell.setAttribute('aria-busy', isLoading ? 'true' : 'false');
}

function updateShowMoreVisibility(meta) {
	if (!showMoreButton || !bouquetsList || !meta) {
		return;
	}

	const currentPage = Number(meta.page);
	const totalPagesAvailable = Number(meta.totalPages);
	const bouquestItemsTotal = Number(meta.total);
	const itemsRendered = bouquetsList.children.length;

	const paginationValid =
		currentPage && totalPagesAvailable && totalPagesAvailable >= 1;
	const viewedLastPage = paginationValid && currentPage >= totalPagesAvailable;
	const allItemsRendered =
		bouquestItemsTotal &&
		bouquestItemsTotal > 0 &&
		itemsRendered >= bouquestItemsTotal;

	showMoreButton.hidden = !!viewedLastPage || !!allItemsRendered;
}

function renderChunk(products, shouldReplaceList) {
	if (!bouquetsList) return;
	if (shouldReplaceList) bouquetsList.replaceChildren();

	const startIndex = bouquetsList.children.length;
	const chunkMarkup = products
		.map(() => buildBouquetsListItemShellMarkup())
		.join('');
	bouquetsList.insertAdjacentHTML('beforeend', chunkMarkup);

	const listItems = bouquetsList.querySelectorAll(
		':scope > .bouquets-list-item',
	);
	for (let i = 0; i < products.length; i++) {
		fillBouquetsListItem(listItems[startIndex + i], products[i]);
	}
}

function normalizeBouquetsPage(responseBody, requestedPage) {
	const products = responseBody?.data ?? [];
	const apiMeta = responseBody?.meta ?? {};

	return {
		products,
		meta: {
			page: requestedPage,
			totalPages: Number(apiMeta.pages) >= 1 ? Number(apiMeta.pages) : 1,
			total: Number.isFinite(Number(apiMeta.items))
				? Number(apiMeta.items)
				: products.length,
		},
	};
}

async function fetchPage(page, options) {
	const { appendItems = false, showButtonLoader = false } = options;
	const isInitialChunk = !appendItems;

	if (showButtonLoader) {
		setShowMoreButtonLoading(true);
	}

	if (isInitialChunk && bouquetsList) {
		setBouquetsInitialLoading(true);
		bouquetsList.replaceChildren();
	}

	try {
		const requestParams = {
			page,
			'per-page': itemsPerPage,
		};

		const response = await apiClient.get('/bouquet', {
			params: requestParams,
		});

		const { products, meta } = normalizeBouquetsPage(response.data, page);

		renderChunk(products, !appendItems);
		lastLoadedPage = page;
		updateShowMoreVisibility(meta);
	} catch (error) {
		showErrorNotification(extractErrorMessage(error));
	} finally {
		if (showButtonLoader) {
			setShowMoreButtonLoading(false);
		}

		if (isInitialChunk) {
			setBouquetsInitialLoading(false);
		}
	}
}

async function resetAndLoadFirstPage() {
	lastLoadedPage = 0;
	if (showMoreButton) {
		showMoreButton.hidden = true;
	}
	await fetchPage(1, { appendItems: false, showButtonLoader: false });
}

function handleShowMoreClick() {
	const nextPage = lastLoadedPage + 1;
	fetchPage(nextPage, { appendItems: true, showButtonLoader: true });
}

function initBouquetsFromApi() {
	if (!bouquetsList || !showMoreButton) {
		return;
	}

	showMoreButton.addEventListener('click', handleShowMoreClick);

	resetAndLoadFirstPage();
}

initBouquetsFromApi();
