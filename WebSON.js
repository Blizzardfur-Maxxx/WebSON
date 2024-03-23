function compileSection(sectionData, sectionElement) {
    sectionData.forEach(item => {
        switch (item['type']) {
            case 'title':
                const title = document.createElement('h1');
                title.textContent = item['text'];
                sectionElement.appendChild(title);
                break;
            case 'navigation':
            case 'links':
                const container = document.createElement('div');
                container.classList.add('navigation-container');
                item['items'].forEach(navItem => {
                    const link = document.createElement('a');
                    link.textContent = navItem['text'];
                    link.href = navItem['url'];
                    link.addEventListener('click', event => {
                        event.preventDefault();
                        generateWebPage(navItem['url']);
                    });
                    container.appendChild(link);
                });
                sectionElement.appendChild(container);
                break;
            case 'heading':
                const heading = document.createElement('h' + item['level']);
                heading.textContent = item['text'];
                sectionElement.appendChild(heading);
                break;
            case 'paragraph':
                const paragraph = document.createElement('p');
                paragraph.textContent = item['text'];
                sectionElement.appendChild(paragraph);
                break;
            case 'image':
                const image = document.createElement('img');
                image.src = item['src'];
                image.alt = item['alt'];
                if (item['size']) {
                    image.style.width = item['size'] + 'px';
                }
                sectionElement.appendChild(image);
                break;
            case 'text':
                const textElement = document.createElement('p');
                textElement.textContent = item['content'];
                sectionElement.appendChild(textElement);
                break;
            case 'form':
                const form = document.createElement('form');
                form.method = item['method'] || 'get';
                form.action = item['action'] || '#';
                item['fields'].forEach(field => {
                    const label = document.createElement('label');
                    label.textContent = field['label'];
                    form.appendChild(label);
                    const input = document.createElement('input');
                    input.type = field['type'];
                    input.name = field['name'] || '';
                    input.placeholder = field['placeholder'] || '';
                    form.appendChild(input);
                    form.appendChild(document.createElement('br'));
                });
                const submitBtn = document.createElement('button');
                submitBtn.type = 'submit';
                submitBtn.textContent = item['submitText'] || 'Submit';
                form.appendChild(submitBtn);
                sectionElement.appendChild(form);
            case 'js':
                if (item['text']) {
                    try {
                        eval(item['text']);
                    } catch (error) {
                        console.error('Error executing JavaScript code:', error);
                    }
                }
                break;
            case 'div':
                const div = document.createElement('div');
                if (item['id']) {
                    div.id = item['id'];
                }
                if (item['style']) {
                    div.style.cssText = item['style'];
                }
                if (item['events']) {
                    Object.entries(item['events']).forEach(([event, handler]) => {
                        div.addEventListener(event, () => {
                            eval(handler);
                        });
                    });
                }
                sectionElement.appendChild(div);
                break;
            default:
                console.error('Unknown content type:', item['type']);
        }
    });
}

function loadCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

function compileCSS(jsonData) {
    const globalCSS = jsonData['CSS'] || {};
    const globalCSSFile = jsonData['CSSFile'];

    if (globalCSSFile) {
        loadCSS(globalCSSFile);
    } else {
        const cssStyles = Object.entries(globalCSS).map(([selector, styles]) => {
            const styleStr = Object.entries(styles).map(([property, value]) => {
                return `${property}: ${value};`;
            }).join('\n');
            return `${selector} { ${styleStr} }`;
        }).join('\n');
        const styleElement = document.getElementById('global-css');
        styleElement.textContent = cssStyles;
    }
}

function compilePageCSS(jsonData) {
    const pageCSS = jsonData['CSS'] || {};
    const cssStyles = Object.entries(pageCSS).map(([selector, styles]) => {
        const styleStr = Object.entries(styles).map(([property, value]) => {
            return `${property}: ${value};`;
        }).join('\n');
        return `${selector} { ${styleStr} }`;
    }).join('\n');
    const styleElement = document.createElement('style');
    styleElement.textContent = cssStyles;
    document.head.appendChild(styleElement);
}

function generateWebPage(url) {
    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            console.log('JSON Data:', jsonData);
            document.body.innerHTML = '';
            generateContent(jsonData);
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function generateContent(jsonData) {
    const sections = jsonData['Sections'];
    Object.keys(sections).forEach(sectionKey => {
        const sectionData = sections[sectionKey];
        const sectionDiv = document.createElement('div');
        if (sectionData['id']) {
            sectionDiv.id = sectionData['id'];
        }
        document.body.appendChild(sectionDiv);

        if (sectionData['content']) {
            compileSection(sectionData['content'], sectionDiv);
        }
    });

    compilePageCSS(jsonData);
}

fetch('index.json')
    .then(response => response.json())
    .then(jsonData => {
        generateContent(jsonData);
        compileCSS(jsonData);
    })
    .catch(error => console.error('Error fetching JSON:', error));