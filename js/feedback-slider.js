import Swiper from 'swiper';
import { A11y, Navigation } from 'swiper/modules';

import 'swiper/css';

import { apiClient } from './apiClient';
import { showErrorNotification } from './notifications';

const feedbackSliderStage = document.querySelector('#feedback-slider-stage');
const feedbackSliderTrack = document.getElementById('feedback-slider-list');
const feedbackLoader = document.getElementById('feedback-loader');
const feedbackSliderViewport = document.querySelector(
	'.feedback-slider-viewport',
);

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buildFeedbackSlideShellMarkup() {
	const markup = `
    <li class="swiper-slide feedback-slider-slide">
      <div class="feedback-slide-row"></div>
    </li>`;
	return markup;
}

function buildFeedbackCard(feedback) {
	const card = document.createElement('div');
	card.className = 'feedback-item';
	card.setAttribute('data-feedback-id', String(feedback.id ?? ''));

	const text = document.createElement('p');
	text.className = 'feedback-text';
	text.textContent = feedback.text ?? '';

	const author = document.createElement('p');
	author.className = 'feedback-author';
	author.textContent = feedback.author ?? '';

	card.append(text, author);
	return card;
}

function setFeedbackLoading(isLoading) {
	if (feedbackLoader) {
		feedbackLoader.hidden = !isLoading;
	}
	if (feedbackSliderViewport) {
		feedbackSliderViewport.setAttribute(
			'aria-busy',
			isLoading ? 'true' : 'false',
		);
	}
}

async function bootFeedbackSlider() {
	if (!feedbackSliderStage || !feedbackSliderTrack) {
		setFeedbackLoading(false);
		return;
	}

	try {
		const response = await apiClient.get('/feedback');
		const body = response.data;
		const feedbackItems = Array.isArray(body) ? body : (body?.data ?? []);

		feedbackSliderTrack.replaceChildren();

		if (feedbackItems.length === 0) {
			return;
		}

		for (const item of feedbackItems) {
			const slideMarkup = buildFeedbackSlideShellMarkup();
			feedbackSliderTrack.insertAdjacentHTML('beforeend', slideMarkup);
			const row = feedbackSliderTrack.lastElementChild.querySelector(
				'.feedback-slide-row',
			);
			row.append(buildFeedbackCard(item));
		}

		new Swiper(feedbackSliderStage, {
			modules: [Navigation, A11y],
			slidesPerView: 1,
			spaceBetween: 24,
			slidesPerGroup: 1,
			speed: prefersReducedMotion() ? 0 : 480,
			navigation: {
				prevEl: '[data-feedback-prev]',
				nextEl: '[data-feedback-next]',
			},
			a11y: {
				prevSlideMessage: 'Previous feedback',
				nextSlideMessage: 'Next feedback',
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
			extractErrorMessage(error, 'Failed to load feedback.'),
		);
	} finally {
		setFeedbackLoading(false);
	}
}

bootFeedbackSlider();
