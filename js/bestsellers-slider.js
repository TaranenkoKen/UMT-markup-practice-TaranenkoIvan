import Swiper from 'swiper';
import { A11y, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import { apiClient } from './apiClient';
import { showErrorNotification } from './notifications';

const bestsellersSliderStage = document.querySelector(
	'#bestsellers-slider-stage',
);
const bestsellersSliderTrack = document.getElementById(
	'bestsellers-slider-list',
);
const bestsellersLoader = document.getElementById('bestsellers-loader');
const bestsellersSliderViewport = document.querySelector(
	'.bestsellers-slider-viewport',
);

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buildBestsellerSlideShellMarkup() {
	return `
    <li class="swiper-slide bestsellers-slider-slide">
      <div class="bestsellers-slide-row"></div>
    </li>`;
}

function buildBestsellerCard(item) {
	const card = document.createElement('div');
	card.className = 'bestsellers-list-item bouquet-card';

	card.innerHTML = `
		<img
			src="${item.img}"
			srcset="${item.img} 2x"
			alt="${item.title || 'Bouquet'}"
			class="bestsellers-image"
		/>
		<div>
			<h3 class="section-subtitle">${item.title}</h3>
			<p class="section-subdescription bestsellers-description">
				${item.desc}
			</p>
			<p class="price">$${item.price}</p>
		</div>
	`;
	return card;
}

function setBestsellersLoading(isLoading) {
	if (bestsellersLoader) {
		bestsellersLoader.hidden = !isLoading;
	}
	if (bestsellersSliderViewport) {
		bestsellersSliderViewport.setAttribute(
			'aria-busy',
			isLoading ? 'true' : 'false',
		);
	}
}

async function bootBestsellersSlider() {
	if (!bestsellersSliderStage || !bestsellersSliderTrack) {
		setBestsellersLoading(false);
		return;
	}

	try {
		const response = await apiClient.get('/bestsellers');
		const body = response.data;
		const bestsellerItems = Array.isArray(body) ? body : (body?.data ?? []);

		bestsellersSliderTrack.replaceChildren();

		if (bestsellerItems.length === 0) {
			return;
		}

		for (const item of bestsellerItems) {
			const slideMarkup = buildBestsellerSlideShellMarkup();
			bestsellersSliderTrack.insertAdjacentHTML('beforeend', slideMarkup);
			const row =
				bestsellersSliderTrack.lastElementChild.querySelector(
					'.bestsellers-slide-row',
				) || bestsellersSliderTrack.lastElementChild;
			row.append(buildBestsellerCard(item));
		}

		new Swiper(bestsellersSliderStage, {
			modules: [Navigation, Pagination, A11y],
			slidesPerView: 1,
			spaceBetween: 24,
			slidesPerGroup: 1,
			speed: prefersReducedMotion() ? 0 : 480,

			navigation: {
				prevEl: '[data-bestsellers-prev]',
				nextEl: '[data-bestsellers-next]',
			},

			pagination: {
				el: '.bestsellers-pagination .swiper-pagination',
				clickable: true,
				bulletClass: 'pagination-dot',
				bulletActiveClass: 'pagination-dot__active',
				renderBullet: function (index, className) {
					return `<li class="${className}"></li>`;
				},
			},

			a11y: {
				prevSlideMessage: 'Previous bouquet',
				nextSlideMessage: 'Next bouquet',
			},
			breakpoints: {
				768: {
					slidesPerView: 2,
					spaceBetween: 24,
				},
				1440: {
					slidesPerView: 3,
					spaceBetween: 32,
				},
			},
		});
	} catch (error) {
		showErrorNotification(
			showErrorNotification(error, 'Failed to load bestsellers.'),
		);
	} finally {
		setBestsellersLoading(false);
	}
}

bootBestsellersSlider();
