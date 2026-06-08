const menuBtnRef = document.querySelector('[data-menu-button]');
const mobileMenuRef = document.querySelector('[data-menu]');
const mobileMenuLinkRef = document.querySelectorAll('.mobile-nav-link');
const mobileMenuButton = document.querySelector('.mobile-menu__button');

menuBtnRef.addEventListener('click', () => {
	window.scrollTo(0, 0);

	const expanded = menuBtnRef.getAttribute('aria-expanded') === 'true' || false;
	menuBtnRef.setAttribute('aria-expanded', !expanded);

	document.body.classList.toggle('menu-open');

	menuBtnRef.classList.toggle('is-open');
	mobileMenuRef.classList.toggle('is-open');
});

mobileMenuLinkRef.forEach((ref) => {
	ref.addEventListener('click', (event) => {
		menuBtnRef.setAttribute('aria-expanded', false);

		document.body.classList.remove('menu-open');

		menuBtnRef.classList.remove('is-open');
		mobileMenuRef.classList.remove('is-open');
	});
});

mobileMenuButton.addEventListener('click', (event) => {
	menuBtnRef.setAttribute('aria-expanded', false);

	document.body.classList.remove('menu-open');

	menuBtnRef.classList.remove('is-open');
	mobileMenuRef.classList.remove('is-open');
});

window.addEventListener('resize', () => {
	if (window.innerWidth > 1440) {
		menuBtnRef.setAttribute('aria-expanded', false);

		document.body.classList.remove('menu-open');

		menuBtnRef.classList.remove('is-open');
		mobileMenuRef.classList.remove('is-open');
	}
});
