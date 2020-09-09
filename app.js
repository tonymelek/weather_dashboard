let world_cities = []
let saved_cities = []
const api_key = 'd05b6385102502383aa0588c693a27e9'
const date = moment().format('ddd, DD/MM/YYYY')

if (!localStorage.getItem('world_cities')) {
    $.getJSON('./cities.json', function (data) {
        localStorage.setItem('world_cities', JSON.stringify(data))
        world_cities = data
    })
} else {
    world_cities = JSON.parse(localStorage.getItem('world_cities'))
}

if (localStorage.getItem('saved_cities')) {
    saved_cities = JSON.parse(localStorage.getItem('saved_cities'))
    for (let city of saved_cities) {
        let new_row = $(`<tr id=row_${city.id}></tr>`)
        let new_data = $(`<td class="text-center">${city.City},${city.Country}</td>`)
        new_row.append(new_data)
        $('tbody').append(new_row)
    }
}






$('.form-control').keyup(function () {
    $('.search-results').hide()
    console.clear()
    $('.results-list').empty()
    if ($(this).val().length > 3) {
        let found = false
        for (let i in world_cities) {
            if (world_cities[i].City.toLowerCase().includes($(this).val().toLowerCase())) {
                found = true
                let new_li = $(`<li id=city_${i}>${world_cities[i].City}, ${world_cities[i].Country}</li>`)
                $('.results-list').append(new_li)
            }
        }
        found ? $('.search-results').slideDown('slow') : $('.search-results').slideUp('slow')
    }


})
$('form').submit((e) => {
    e.preventDefault();
    $('.search-results').hide()
    if ($('.results-list li:first-child').attr('id')) {
        save_new_city($('.results-list li:first-child').attr('id').slice(5))
        get_req($('.results-list li:first-child').attr('id').slice(5))
    }
})

$(document).on('click', '.results-list li', function () {
    $('.search-results').hide()
    save_new_city(this.id.slice(5))
    get_req(this.id.slice(5))

})
$(document).on('dblclick', 'td', function () {
    $('.search-results').hide()
    remove_city(this.parentElement.id.slice(4))
    $(`#${this.parentElement.id}`).remove()
})
$(document).on('click', 'td', function () {
    $('.search-results').hide()
    let city_id = this.parentElement.id.slice(4)
    get_req(city_id)
})

function get_req(city_id, lon, lat) {
    if (city_id !== null) {
        lon = world_cities[city_id].Lng
        lat = world_cities[city_id].Lat
    }
    let queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`
    $.ajax({
        method: 'GET',
        url: queryURL
    }).then(function (response) {

        if (city_id !== null) {
            $('#city').text(`${world_cities[city_id].City}, ${world_cities[city_id].Country} - ${date}`)
        } else {

            let city = response.timezone.split('/')[1] + ', ' + response.timezone.split('/')[0]
            $('#city').text(`${city} - ${date}`)
        }

        $('#city').append($(`<span><img src="http://openweathermap.org/img/wn/${response.current.weather[0].icon}.png" width=80></span>`))
        $('#temp').text(`Temperature: ${response.current.temp} C`)
        $('#humidity').text(`Humidity: ${response.current.humidity} %`)
        $('#wind').text(`Wind Speed: ${response.current.wind_speed} km/h`)
        $('#uv').text(`UV index:`)
        let uv_color = ""
        switch (parseInt(response.current.uvi)) {
            case 1:
                uv_color = '#00b050'
                break;
            case 2:
                uv_color = '#00b050'
                break;
            case 3:
                uv_color = '#ffff00'
                break;
            case 4:
                uv_color = '#ffff00'
                break;
            case 5:
                uv_color = '#ffff00'
                break;
            case 6:
                uv_color = '#ff9933'
                break;
            case 7:
                uv_color = '#ff9933'
                break
            case 8:
                uv_color = '#c00000'
                break;
            case 9:
                uv_color = '#c00000'
                break;
            case 10:
                uv_color = '#c00000'
                break;
            default:
                uv_color = '#d39dd3'
                break;
        }

        let uvi = $(`<span style="background-color:${uv_color}"> ${response.current.uvi} </span>`)
        $('#uv').append(uvi)
        for (let i = 1; i < 6; i++) {
            $(`h3.day${i}`).text(`${moment().add(i, 'day').format('DD/MM/YY')}`)
            $(`img.day${i}`).attr('src', `http://openweathermap.org/img/wn/${response.daily[i].weather[0].icon}.png`)
            $(`p.day${i}`).html(`Temp.: ${response.daily[i].temp.day}C<br>Humidity: ${response.daily[i].humidity}%`)

        }

    }).catch(function (error) {
        console.error(error);
    })





}

function remove_city(id) {
    for (let i in saved_cities) {
        if (saved_cities[i].id == id) {
            saved_cities.splice(i, 1)
        }
        localStorage.setItem('saved_cities', JSON.stringify(saved_cities))
    }
}

function save_new_city(id) {
    let found = false
    id = parseInt(id)
    let new_saved_city = {
        id: id,
        City: world_cities[id].City,
        Lng: world_cities[id].Lng,
        Lat: world_cities[id].Lat,
        Country: world_cities[id].Country
    }
    for (city of saved_cities) {
        if (city.id == new_saved_city.id) {
            found = true
        }
    }
    if (!found) {
        saved_cities.push(new_saved_city)
        localStorage.setItem('saved_cities', JSON.stringify(saved_cities))
        let new_row = $(`<tr id=row_${new_saved_city.id}></tr>`)
        let new_data = $(`<td class="text-center">${new_saved_city.City},${new_saved_city.Country}</td>`)
        new_row.append(new_data)
        $('tbody').append(new_row)
    }
}


//Initial Run
var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    var crd = pos.coords;
    get_req(null, crd.longitude, crd.latitude)

}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);