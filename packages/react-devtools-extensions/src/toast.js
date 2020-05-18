/* global chrome */

let toastElement = null;
let toastTimer = null;

const toastTimeout = 5000;
const toastColors = {
  message: '#61dafb',
  warning: '#db6b00',
};

function hideToast() {
  clearTimeout(toastTimer);
  if (toastElement) {
    document.body.removeChild(toastElement);
    toastElement = null;
  }
}

module.exports = {
  injectToast: target => {
    target.__REACT_DEVTOOLS_SHOW_TOAST__ = (message, type) => {
      const color = toastColors[type] || toastColors.message;
      console.log(
        `%c ⚛ ${message} `,
        `background: ${color}; padding: 1px; border-radius: 3px;  color: #000`,
      );

      if (!toastElement) {
        toastElement = document.createElement('div');
        toastElement.addEventListener('click', hideToast);

        const toastContainerElement = document.createElement('div');
        toastContainerElement.style.position = 'fixed';
        toastContainerElement.style.bottom = '6px';
        toastContainerElement.style.left = '0';
        toastContainerElement.style.right = '0';
        toastContainerElement.style.height = '0';
        toastContainerElement.style.display = 'flex';
        toastContainerElement.style.alignItems = 'flex-end';
        toastContainerElement.style.justifyContent = 'center';
        toastContainerElement.style.zIndex = '999999999999999999999';
        toastContainerElement.style.fontFamily =
          '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif';
        toastContainerElement.style.fontSize = '14px';

        const toastWrapperElement = document.createElement('div');
        toastWrapperElement.id = 'react-toast-wrapper';
        toastWrapperElement.style.padding = '6px 12px';
        toastWrapperElement.style.background = color;
        toastWrapperElement.style.color = 'black';
        toastWrapperElement.style.borderRadius = '3px';
        toastWrapperElement.style.flex = 'auto 0 1';
        toastWrapperElement.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';

        const toastContentElement = document.createElement('div');
        toastContentElement.id = 'react-toast-content';

        toastWrapperElement.appendChild(toastContentElement);
        toastContainerElement.appendChild(toastWrapperElement);
        toastElement.appendChild(toastContainerElement);
        document.body.appendChild(toastElement);
      } else {
        toastElement.querySelector(
          '#react-toast-wrapper',
        ).style.background = color;
      }

      toastElement.querySelector(
        '#react-toast-content',
      ).innerText = `⚛ ${message}`;

      clearTimeout(toastTimer);
      toastTimer = setTimeout(hideToast, toastTimeout);
    };
  },
  showToast: (message, type) =>
    chrome.devtools.inspectedWindow.eval(
      `window.__REACT_DEVTOOLS_SHOW_TOAST__('${message}', '${type ||
        'message'}')`,
    ),
};
