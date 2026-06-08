const notificationRootId = 'notification-root';

function ensureNotificationRoot() {
	let root = document.getElementById(notificationRootId);
	if (!root) {
		root = document.createElement('div');
		root.id = notificationRootId;
		root.setAttribute('aria-live', 'polite');
		document.body.append(root);
	}
	return root;
}

function buildNotificationElement(message, varint) {
	const element = document.createElement('div');

	element.className = `notification notification--${varint}`;
	element.textContent = message;

	return element;
}

export function showNotification(message) {
	const root = ensureNotificationRoot();
	const element = buildNotificationElement(message, 'error');
	root.append(element);

	const dismissMs = 7000;

	window.setTimeout(() => {
		element.remove();
	}, dismissMs);
}

export function showErrorNotification(message) {
	showNotification(message, 'error');
}

export function showSuccessNotification(message) {
	showNotification(message, 'success');
}
