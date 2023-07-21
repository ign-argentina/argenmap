class NotificationChecker {

    constructor() {
        this.notifiManager = new NotificationManager();
    }

    check() {


        this.loadMD("src/docs/features.md", 2, Infinity)
            .then(selectedText => {
                const lines = selectedText.split('\n');
                const lastIndex = lines.length - 4; // Index of the antepenultimate line

                lines.forEach((line, i) => {
                    if (i > lastIndex) {
                        localStorage.setItem('lastFunctionSeen', (i - 3));
                        return; // Ignore lines after the antepenultimate line
                    }

                    const getExited = localStorage.getItem('lastFunctionSeen'); //First time here or any change since last time?

                    if ((getExited != null) && (parseInt(getExited) < i)) {
                        this.notifiManager.addNoti('developerLogo');
                        this.waitForElementAndAddNoti('load-functions'); // Wait for the element to be available
                    }

                });
            });
    }


    /**
         * Loads the Markdown file from the specified URL and selects the specified lines.
         * @param {string} url - The URL of the Markdown file.
         * @param {number} from - The index of the first line to select.
         * @param {number} to - The index of the last line to select.
         * @returns {Promise<string>} - A promise that resolves with the selected text.
         */
    loadMD(url, from, to) {
        return fetch(url)
            .then(response => response.text())
            .then(markdown => {
                const html = marked(markdown);
                const lines = html.split('\n');
                const selectedLines = lines.slice(from, to);
                const selectedText = selectedLines.join('\n');
                return selectedText;
            })
            .catch(error => {
                console.error('Error al cargar el archivo Markdown:', error);
            });
    }

    waitForElementAndAddNoti(id) {
        const targetNode = document.getElementById(id);
        if (targetNode) {
            this.notifiManager.addNoti(id);
        } else {
            const observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (const addedNode of mutation.addedNodes) {
                            if (addedNode.id === id) {
                                this.notifiManager.addNoti(id);
                                observer.disconnect();
                                break;
                            }
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

}


class NotificationManager {
    constructor() {
        this.idSet = new Set();
    }

    /**
     * Adds a notification dot to the specified element.
     * @param {string} id - The ID of the element to add the notification dot to.
     */

    addNoti(id) {
        const temporaryNotification = document.createElement("div");
        temporaryNotification.classList.add('notification-dot');

        const temporaryDivToChange = document.getElementById(id);
        temporaryDivToChange.appendChild(temporaryNotification);

        this.idSet.add(id);
    }

    removeNoti(id) {
        const temporaryDivToChange = document.getElementById(id);
        const notificationDot = temporaryDivToChange.querySelector('.notification-dot');

        if (notificationDot) {
            temporaryDivToChange.removeChild(notificationDot);
        }

    }

    cleanAllNoti() {
        this.idSet.forEach((item) => {
            const temporaryDivToChange = document.getElementById(item);
            const notificationDot = temporaryDivToChange.querySelector('.notification-dot');

            if (notificationDot) {
                temporaryDivToChange.removeChild(notificationDot);
            }
        });

        this.idSet.clear(); // Clear the Set after removing all notifications
    }

}

const NotificationChekerr = new NotificationChecker();
