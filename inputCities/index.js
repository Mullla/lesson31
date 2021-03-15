document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const input = document.getElementById('select-cities'),
        btn = document.querySelector('.button'),
        closeBtn = document.querySelector('.close-button');

    // изначально кнопка не активна
    btn.style.pointerEvents = 'none';

    const url = './db/db_cities.json';

    const getLocale = () => {
        let locale = prompt('Введите локализацию: ru, en, de').toLowerCase().trim();

        while (locale !== 'en' && locale !== 'ru' && locale !== 'de') {
            locale = prompt('Введите локализацию: ru, en, de').toLowerCase().trim();
        }
        return locale.toUpperCase();
    }


    // info создает куки
    const setCookie = (key, value, year, month, day, path, domain, secure) => {
        let cookieStr = key + '=' + encodeURI(value); //key не кодирую, так как они на англ
        if(year){
            const expires = new Date(year, month-1, day);
            cookieStr += '; expires=' + expires.toGMTString();
        }
        cookieStr += path ? '; path=' + encodeURI(path) : '';
        cookieStr += domain ? '; domain=' + encodeURI(domain) : '';
        cookieStr += secure ? '; secure=' + secure : '';

        document.cookie = cookieStr;
    }

    // info функция ищет куки по имени, если его нет, возвращает undefined
    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp("(?:^|; )" + 
            name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
            return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    // info если куки нет, то записывает его
    if(!getCookie('locale')){
        setCookie('locale', getLocale(), '2022', '01', '01');
    }
    

    // info отправляет запрос на сервер
    // in: url - json-файл, body - ключ локали: en, ru, ge
    const postData = (url, body) => {
        return fetch(url, {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }
    
    let body = getCookie('locale');

    // объявляю, что есть данные
    let data;

    // если их нет, то отправляю post-запрос
    if(!data) {
        postData(url, body)
        .then( response => {
            if (response.status !== 200) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then( response => {
            data = response[body];
            renderList(data);
            // записываю данные в localStorage
            localStorage.setItem('localeData', JSON.stringify(data));
        })
        .catch ( err => {
            console.log(err);
        });
    } else {
        // info получаю данные из localStorage
        data = JSON.parse(localStorage.getItem('localeData'));
        renderList(data);
    }


    // in: принимает БД - со всеми ключами
    const renderList = (dbData) => {

        // info создает HTML-элемент для каждого города
        // in: объект, который содержится в массиве cities
        // out: HTML-элемент в верстке
        const createCityElem = (cityObj) => {
            const cityElem = document.createElement('div');
            cityElem.classList.add('dropdown-lists__line');
            cityElem.dataset.cityName = cityObj.name;

            cityElem.innerHTML = `
                <div class="dropdown-lists__city">${cityObj.name}</div>
                <div class="dropdown-lists__count">${cityObj.count}</div>
            `;

            return cityElem;
        }

        // info создает HTML-элемент для каждой страны (это строчка над городами)
        // in: объект, который содержится в массиве стран
        // out: HTML-элемент в верстке
        const createCountryElem = (countryObj) => {
            const countryElem = document.createElement('div');
            countryElem.classList.add('dropdown-lists__total-line');
            countryElem.dataset.id = countryObj.country;

            countryElem.innerHTML = `
                <div class="dropdown-lists__country">${countryObj.country}</div>
                <div class="dropdown-lists__count">${countryObj.count}</div>
            `;

            return countryElem;
        }

        // info создает HTML-элемент для каждой страны (это блок, в котором список городов и может быть верхняя строчка с названием страны)
        // in: 
        // объект, который содержится в массиве стран, 
        // flag: если total, то создает над списком элементов строку со страной, 
        // num - количество выводимых городов
        // out: HTML-элемент в верстке
        const createCountryBlock = (countryObj, flag, num) => {
            const countryBlock = document.createElement('div');
            countryBlock.classList.add('dropdown-lists__countryBlock');

            if(flag === 'total'){
                countryBlock.append( createCountryElem(countryObj) );
                // регулировать количество выводимых городов
                for (let i = 0; i < num; i++){
                    countryBlock.append( createCityElem(countryObj.cities[i]) )
                }

            // у autocomplete нет total-строки
            } else {
                if( countryObj.length ) {
                    countryObj.forEach( city => countryBlock.append( createCityElem(city) ) );
                } else {
                    countryBlock.insertAdjacentHTML('afterbegin', '<span>Ничего не найдено</span>')
                }
            }

            return countryBlock;
        }

        // info создает список в верстке
        // если массив - нужно указать индекс объекта из БД
        // in: массив со странами (в случае default или объект в остальных случаях) и вид списка: default, select, autocomplete
        // out: HTML-список
        const createList = (country, selector) => {
            const countryList = document.querySelector(`.dropdown-lists__list--${selector} .dropdown-lists__col`);

            // если это список select
            if (selector === 'select') {
                // очищаю список, если он уже был создан
                countryList.innerHTML = '';

                // ? country - объект
                countryList.append(createCountryBlock(country, 'total', country.cities.length));

            // если это список autocomplete
            } else if (selector === 'autocomplete') {
                // очищаю список, если он уже был создан
                countryList.innerHTML = '';

                // ? country - объект
                countryList.append(createCountryBlock(country));

            // если это список default
            } else {
                // очищаю список, если он уже был создан
                countryList.innerHTML = '';
                
                // ! не получает сразу country
                console.log(country)
                setOrder(country);

                // ? country - массив
                country.forEach( countryItem => {
                    // сортирую исходный массив по убыванию
                    countryItem.cities.sort((a, b) => (b.count - a.count));

                    createCountryBlock(countryItem, 'total')
                    countryList.append(createCountryBlock(countryItem, 'total', 3));
                });
            }
        };

        // info при клике на инпут открывается дефолтный селект с топом-3
        input.addEventListener('focus', () => {
            // создаю дефолтный список, только если не открыт селект
            if (document.querySelector('.dropdown-lists__list--select').style.display !== 'block') {

                openBlock('.dropdown-lists__list--default');
                createList(dbData, 'default');
            }
        });

        input.addEventListener('blur', () =>{
            closeBlock('.label');
        })

        input.addEventListener('input', () => {
            // чтобы не зависело от регистра
            let searchedName = input.value.toLowerCase();

            let searchedCityArr = searchCity(searchedName, dbData);

            openBlock('.close-button');

            // закрываются все списки
            closeBlock('.dropdown-lists__list--select');
            closeBlock('.dropdown-lists__list--default');

            // открывается список autocomplete
            openBlock('.dropdown-lists__list--autocomplete');
            createList(searchedCityArr, 'autocomplete');
            
            // когда значение пустое
            if(input.value === ''){

                closeBlock('.close-button');

                openBlock('.label');
                openBlock('.dropdown-lists__list--default');
                closeBlock('.dropdown-lists__list--autocomplete');
                // блокируем кнопку, если удаляем значение из инпута
                btn.style.pointerEvents = 'none';
            }
        })

        const dropdownLists = document.querySelector('.dropdown-lists');
        
        dropdownLists.addEventListener('click', (e) => {
            const target = e.target;

            // ? блок с переключением списков
            // отлавливаю, что клик произошел в дефолтном списке по клику на строчку страны
            if( target.closest('.dropdown-lists__total-line') && target.closest('.dropdown-lists__list--default') ){
                let searchCountry = searchId(target.closest('.dropdown-lists__total-line').dataset.id, dbData);

                createList(searchCountry, 'select');
                openBlock('.dropdown-lists__list--select');
                closeBlock('.dropdown-lists__list--default');

            // отлавливаю если клик произошел по списку селект и по названию страны
            } else if (target.closest('.dropdown-lists__total-line') && target.closest('.dropdown-lists__list--select')){

                openBlock('.dropdown-lists__list--default');
                closeBlock('.dropdown-lists__list--select');

            }

            if(target.closest('.dropdown-lists__line')){
                // нахожу ссылку города в вики
                const cityLink = searchCityLink(target.closest('.dropdown-lists__line').dataset.cityName, dbData);
                btn.href = cityLink;
                // включаю переход по ссылке
                btn.style.pointerEvents = 'auto';
            }

            // ? блок с вводом значений в инпут
            if (target.closest('.dropdown-lists__city') || target.closest('.dropdown-lists__country')){
                // скрываю надпись лейбла
                closeBlock('label');
                // показываю кнопку 'close'
                openBlock('.close-button');
                // заменяю значение инпута на текст элемента, по которому кликнули
                input.value = target.textContent;
            }
            
        });

        closeBtn.addEventListener('click', () => {
            input.value = '';
            
            closeBlock('.dropdown-lists__list--select');
            closeBlock('.dropdown-lists__list--default');

            openBlock('.label');
            // блокируем кнопку, если удаляем значение из инпута
            btn.style.pointerEvents = 'none';
        });

    }


    // info открывает элемент по селектору, задавая ему значение 'block'
    const openBlock = selector => {
        const elem = document.querySelector(selector);
        elem.style.display = 'block';
    };

    // info скрывает элемент по селектору, задавая ему значение 'none'
    const closeBlock = selector => {
        const elem = document.querySelector(selector);
        elem.style.display = 'none';
    };

    // info ищет объект из БД по дата-атрибуту
    const searchId = (str, arr) => {
        return arr.find(item => item.country === str);
    }

    // info ищет ссылку города в БД
    const searchCityLink = (str, arr) => {
        let cityObj = {};

        arr.find( (item, array) => {
            array = item.cities;
            cityObj = array.find( city => city.name === str);

            return cityObj;
        });

        return cityObj.link;
    }

    // info ищет название города
    // возвращает массив объектов
    const searchCity = (str, arr) => {
        let citiesArr = [];

        arr.filter( (item, array) => {
            array = item.cities;

            array.filter( city => {
                if(city.name.toLowerCase().substring(0, str.length) === str) citiesArr.push(city);
            });

        });

        return citiesArr;
    }

    // info перемещает элемент массива с одного индекса на другой
    const arrayMove = (arr, fromIndex, toIndex) => {
        let element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }

    const setOrder = (country) => {
        let index;

        if(getCookie('locale') === 'EN'){
            index = country.findIndex( item => item.country === 'United Kingdom');
            arrayMove(country, index, 0);

        } else if (getCookie('locale') === 'DE'){
            index = country.findIndex( item => item.country === 'Deutschland');
            arrayMove(country, index, 0);

        } else if (getCookie('locale') === 'RU'){
            index = country.findIndex( item => item.country === 'Россия');
            arrayMove(country, index, 0);
        }

        return country;
    }

});

