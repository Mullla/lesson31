'use strict';

// const addLoader = () => {
//     const loader = document.createElement('div');
//     loader.classList.add('loader');
//     loader.insertAdjacentHTML('beforeend',  `
//         <div class="sk-cube-grid">
//             <div class="sk-cube sk-cube1"></div>
//             <div class="sk-cube sk-cube2"></div>
//             <div class="sk-cube sk-cube3"></div>
//             <div class="sk-cube sk-cube4"></div>
//             <div class="sk-cube sk-cube5"></div>
//             <div class="sk-cube sk-cube6"></div>
//             <div class="sk-cube sk-cube7"></div>
//             <div class="sk-cube sk-cube8"></div>
//             <div class="sk-cube sk-cube9"></div>
//         </div>`)

//     return loader;
// }


document.addEventListener('DOMContentLoaded', () => {

    const input = document.getElementById('select-cities'),
        btn = document.querySelector('.button'),
        closeBtn = document.querySelector('.close-button');

    // изначально кнопка не активна
    btn.style.pointerEvents = 'none';

    const url = './db/db_cities.json';
    // info получаем данные из json-файла
    const getData = (url, render, func) => {
        
        return fetch(url)
        .then( response => {
            if(response.ok){
                return response.json();;
            } else {
                throw new Error(response.statusText);
            }
        })
        .then( response => {
            render(response);
            return response;
        } )
        .then ( func )
        .catch( err => {
            console.log(err);
        });

    }

    getData(url, (dbData) => renderList(dbData), (dbData) => console.log(dbData.RU))

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
                createList(dbData.RU, 'default');
            }
        });

        input.addEventListener('blur', () =>{
            closeBlock('.label');
        })

        input.addEventListener('input', () => {
            // чтобы не зависело от регистра
            let searchedName = input.value.toLowerCase();

            let searchedCityArr = searchCity(searchedName, dbData.RU);

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
                let searchCountry = searchId(target.closest('.dropdown-lists__total-line').dataset.id, dbData.RU);

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
                const cityLink = searchCityLink(target.closest('.dropdown-lists__line').dataset.cityName, dbData.RU);
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

    // info анимация появления
    const slideInAnimation = ({timing, draw, duration}) => {

        let start = performance.now();

        requestAnimationFrame(function slideInAnimation(time) {
            // timeFraction изменяется от 0 до 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            // вычисление текущего состояния анимации
            let progress = timing(timeFraction);

            draw(progress); // отрисовать её

            if (timeFraction < 1) {
            requestAnimationFrame(slideInAnimation);
            }

        });

    }

    // info анимация исчезновения
    const slideOutAnimation = ({timing, draw, duration}) => {

        let start = performance.now();

        requestAnimationFrame(function slideOutAnimation(time) {
            // timeFraction изменяется от 0 до 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            // вычисление текущего состояния анимации
            let progress = timing(timeFraction);

            draw(progress); // отрисовать её

            if (timeFraction < 1) {
            requestAnimationFrame(slideOutAnimation);
            }

        });

    }

});

