'use strict';

// стили прелоадера
const addStyles = () => {
    let style = document.getElementById('preloader-style');

    if(!style){
        style = document.createElement('style');
        style.id = 'preloader-style';
    }

    style.textContent = `
        .loader {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(42, 42, 42, .4);
            z-index: 51;
            transition: 1s all;
            visibility: visible;
        }
        
        .sk-cube-grid {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            margin: 100px auto;
        }
        
        .sk-cube-grid .sk-cube {
            width: 33%;
            height: 33%;
            background-color: #039;
            float: left;
            -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
                    animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out; 
        }
        .sk-cube-grid .sk-cube1 {
            -webkit-animation-delay: 0.2s;
                    animation-delay: 0.2s; }
        .sk-cube-grid .sk-cube2 {
            -webkit-animation-delay: 0.3s;
                    animation-delay: 0.3s; }
        .sk-cube-grid .sk-cube3 {
            -webkit-animation-delay: 0.4s;
                    animation-delay: 0.4s; }
        .sk-cube-grid .sk-cube4 {
            -webkit-animation-delay: 0.1s;
                    animation-delay: 0.1s; }
        .sk-cube-grid .sk-cube5 {
            -webkit-animation-delay: 0.2s;
                    animation-delay: 0.2s; }
        .sk-cube-grid .sk-cube6 {
            -webkit-animation-delay: 0.3s;
                    animation-delay: 0.3s; }
        .sk-cube-grid .sk-cube7 {
            -webkit-animation-delay: 0s;
                    animation-delay: 0s; }
        .sk-cube-grid .sk-cube8 {
            -webkit-animation-delay: 0.1s;
                    animation-delay: 0.1s; }
        .sk-cube-grid .sk-cube9 {
            -webkit-animation-delay: 0.2s;
                    animation-delay: 0.2s; }
        
        @-webkit-keyframes sk-cubeGridScaleDelay {
            0%, 70%, 100% {
            -webkit-transform: scale3D(1, 1, 1);
                    transform: scale3D(1, 1, 1);
            } 35% {
            -webkit-transform: scale3D(0, 0, 1);
                    transform: scale3D(0, 0, 1); 
            }
        }
        
        @keyframes sk-cubeGridScaleDelay {
            0%, 70%, 100% {
            -webkit-transform: scale3D(1, 1, 1);
                    transform: scale3D(1, 1, 1);
            } 35% {
            -webkit-transform: scale3D(0, 0, 1);
                    transform: scale3D(0, 0, 1);
            } 
        }
    `;

    document.head.append(style);
}

// добавляение прелоадера в верстку
const addLoader = () => {
    const loader = document.createElement('div');
    loader.classList.add('loader');
    loader.insertAdjacentHTML('beforeend',  `
        <div class="sk-cube-grid">
            <div class="sk-cube sk-cube1"></div>
            <div class="sk-cube sk-cube2"></div>
            <div class="sk-cube sk-cube3"></div>
            <div class="sk-cube sk-cube4"></div>
            <div class="sk-cube sk-cube5"></div>
            <div class="sk-cube sk-cube6"></div>
            <div class="sk-cube sk-cube7"></div>
            <div class="sk-cube sk-cube8"></div>
            <div class="sk-cube sk-cube9"></div>
        </div>`)


    document.body.insertAdjacentElement('afterbegin', loader);
}

addStyles();
addLoader();

// когда дом-дерево загружено
document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(() => {
        document.querySelector('.loader').style.display = 'none';
    }, 700)
    


    const input = document.getElementById('select-cities'),
        btn = document.querySelector('.button'),
        closeBtn = document.querySelector('.close-button');

    // изначально кнопка не активна
    btn.style.pointerEvents = 'none';

    const url = './db/db_cities.json';
    // info получаем данные из json-файла
    const getData = (url, render) => {
        
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
        } )
        .catch( err => {
            console.log(err);
        });

    }

    getData(url, (dbData) => renderList(dbData));

    // in: принимает БД - со всеми ключами
    const renderList = (dbData) => {
        const defaultList = document.querySelector('.dropdown-lists__list--default'),
            selectList = document.querySelector('.dropdown-lists__list--select'),
            autocompleteList = document.querySelector('.dropdown-lists__list--autocomplete'),
            label = document.querySelector('.label');

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
            if (selectList.style.display !== 'block') {

                openBlock(defaultList);
                createList(dbData.RU, 'default');
            }
        });

        input.addEventListener('blur', () =>{
            closeBlock(label);
        })

        // ? здесь autocomplete
        // при вводе значений
        input.addEventListener('input', () => {
            // чтобы не зависело от регистра
            let searchedName = input.value.toLowerCase();

            let searchedCityArr = searchCity(searchedName, dbData.RU);

            openBlock(closeBtn);

            // закрываются все списки
            closeBlock(selectList);
            closeBlock(defaultList);

            // открывается список autocomplete
            openBlock(autocompleteList);
            
            createList(searchedCityArr, 'autocomplete');
            
            // когда значение пустое
            if(input.value === ''){

                closeBlock(closeBtn);

                openBlock(label);
                openBlock(defaultList);
                closeBlock(autocompleteList);
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

                closeBlock(defaultList);

                slideAnimation({
                    duration: 900,
                    timing(timeFraction){
                        return timeFraction;
                    },
                    draw(progress){
                        selectList.style.transform = `translate(${-100 *(1 - progress)}%)`;
                        selectList.style.opacity = progress;
                    }
                });
                openBlock(selectList);

                
                createList(searchCountry, 'select');
                

            // отлавливаю если клик произошел по списку селект и по названию страны
            } else if (target.closest('.dropdown-lists__total-line') && target.closest('.dropdown-lists__list--select')){

                closeBlock(selectList);

                slideAnimation({
                    duration: 900,
                    timing(timeFraction){
                        return timeFraction;
                    },
                    draw(progress){
                        defaultList.style.transform = `translate(${100 *(1 - progress)}%)`;
                        defaultList.style.opacity = progress;
                    }
                });
                openBlock(defaultList);
                
            }

            // ? вставка ссылки в href
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
                closeBlock(label);
                // показываю кнопку 'close'
                openBlock(closeBtn);
                // заменяю значение инпута на текст элемента, по которому кликнули
                input.value = target.textContent;
            }
            
        });

        closeBtn.addEventListener('click', () => {
            input.value = '';
            
            closeBlock(selectList);
            closeBlock(defaultList);

            openBlock(label);
            // блокируем кнопку, если удаляем значение из инпута
            btn.style.pointerEvents = 'none';
        });

    }


    // info открывает элемент, задавая ему значение 'block'
    const openBlock = elem => {
        elem.style.display = 'block';
    };
    
    // info скрывает элемент, задавая ему значение 'none'
    const closeBlock = elem => {
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

    const slideAnimation = ({timing, draw, duration}) => {

        let start = performance.now();

        requestAnimationFrame(function slideAnimation(time) {
            // timeFraction изменяется от 0 до 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            // вычисление текущего состояния анимации
            let progress = timing(timeFraction);

            draw(progress); // отрисовать её

            if (timeFraction < 1) {
            requestAnimationFrame(slideAnimation);
            }

        });

    }
});

