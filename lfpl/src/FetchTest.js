import { useState, useEffect } from "react";

const URL = 'https://v3.football.api-sports.io/players?league=39&season=2024';

const FetchTest = () => {

    var myHeaders = new Headers();
    myHeaders.append("x-rapidapi-key", "27f7907b6c8558d054ae38596ff84f3a");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    const URL2 = 'https://v3.football.api-sports.io/players?league=39&season=2024&page=';

    useEffect(() => {
            const fetchData = async () => {
                for(let i=1;i<3;i++){
                    const URL3 = URL2 + `${i}`
                    const result = await fetch(URL3, requestOptions);
                result.json().then(json => {
                    console.log(json);
                })
                }
        }
        fetchData();
    }, []);

    return ( 
        <div>
            <h2>Test</h2>
        </div>
     );
}
 
export default FetchTest;