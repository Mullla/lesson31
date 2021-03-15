document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const input = document.getElementById('select-cities'),
        btn = document.querySelector('.button');

        // изначально кнопка не активна
        btn.style.pointerEvents = 'none';

    const url = './db/db_cities.json';
    // получаем данные из json-файла
    const getData = (url, createDefaultList, createSelectList) => {
        
        return fetch(url)
        .then( response => {
            if(response.ok){
                return response.json();;
            } else {
                throw new Error(response.statusText);
            }
        })
        .then( createDefaultList )
        .then ( createSelectList )
        .catch( err => {
            console.log(err);
        });

    }

    const renderDefaultList = () => {
        // получаю дефолтный список, в нем страна и топ-3 города
        // блок внутри которого сам список
        const defaultListBlock = document.querySelector('.dropdown-lists__list--default'),
        // список, внутрь которого будет вставляться значение
            defaultList = defaultListBlock.querySelector('.dropdown-lists__col');


        // создаю каждый элемент списка
        const createDefaultItem = (item, citiesList) => {
            // это весь элемент: страна и города
            const listElem = document.createElement('div');
                listElem.classList.add('dropdown-lists__countryBlock');


            listElem.innerHTML = `
            <div class="dropdown-lists__total-line">
                <div class="dropdown-lists__country">${item.country}</div>
                <div class="dropdown-lists__count">${item.count}</div>
            </div>

            <div class="dropdown-lists__line">
                <div class="dropdown-lists__city dropdown-lists__city--ip">${citiesList[0].name}</div>
                <div class="dropdown-lists__count">${citiesList[0].count}</div>
            </div>
            <div class="dropdown-lists__line">
                <div class="dropdown-lists__city">${citiesList[1].name}</div>
                <div class="dropdown-lists__count">${citiesList[1].count}</div>
            </div>
            <div class="dropdown-lists__line">
                <div class="dropdown-lists__city">${citiesList[2].name}</div>
                <div class="dropdown-lists__count">${citiesList[2].count}</div>
            </div>
            `;

            return listElem;
        };

        // вставляю каждое значение из бд в дефолтный список
        const createDefaultList = (dbData) => {
            // item - объект с каждой страной
            dbData.RU.forEach( item => { 
                console.log(item)

                // сортировака по убыванию численности
                const sortedCities = item.cities.sort((a, b) => (b.count - a.count));

                // так как в верстке всего 3 поля для городов, вставятся как раз первые 3 значения
                defaultList.append(createDefaultItem(item, sortedCities));
            });


            openSelectList()
        };

        const openSelectList = () => {
            const countryBlock = defaultListBlock.querySelector('.dropdown-lists__total-line');
            
            countryBlock.addEventListener('click', () => {
                openList('.dropdown-lists__list dropdown-lists__list--select');
            });
        }



        const createSelectList = (item) => {

            // это весь элемент: страна и города
            const listElem = document.createElement('div');
                listElem.classList.add('dropdown-lists__countryBlock');

            const countryElem = `
            <div class="dropdown-lists__total-line">
                <div class="dropdown-lists__country">${item.country}</div>
                <div class="dropdown-lists__count">${item.count}</div>
            </div>
            `

            listElem.append(countryElem);

            item.cities.forEach( city => {
                
                const cityElem = `
                    <div class="dropdown-lists__line">
                        <div class="dropdown-lists__city dropdown-lists__city--ip">${city.name}</div>
                        <div class="dropdown-lists__count">${city.count}</div>
                    </div>
                    `;

                listElem.insertAdjacentElement('beforeend', cityElem)
            });

            

            
            

            return listElem;
        }  

        // получаю данные из бд и формирую список
        getData(url, createDefaultList, createSelectList);
    }

    

    const openList = (selector) => {
        const list = document.querySelector(selector);
        list.style.display = 'block';
    }

    const closeList = (selector) => {
        const list = document.querySelector(selector);
        list.style.display = 'none';
    }



    input.addEventListener('focus', () => {
        renderDefaultList();
        openList('.dropdown-lists__list--default');
    });

    // document.addEventListener('click', (e) => {
    //     let target = e.target;

    //     if(!target.closest('.dropdown')){
    //         closeList('.dropdown-lists__list--default');
    //     }
    // });


    

});


