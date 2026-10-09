
const API_KEY = "d64fd4d72449c41633d193c846a49a06";
const TEAM_ID = 47;
const SEASON = 2022;


const bestXI = [
    { name: "Hugo Lloris", search: "Lloris" },
    { name: "Cristian Romero", search: "Romero" },
    { name: "Eric Dier", search: "Dier" },
    { name: "Ben Davies", search: "Davies" },
    { name: "Ivan Perisic", search: "Perisic" },
    { name: "Pierre-Emile Hojbjerg", search: "Hojbjerg" },
    { name: "Rodrigo Bentancur", search: "Bentancur" },
    { name: "Dejan Kulusevski", search: "Kulusevski" },
    { name: "Son Heung-Min", search: "Heung-Min" },
    { name: "Harry Kane", search: "Kane" },
    { name: "Richarlison", search: "Richarlison" }
];




//Tottenham 3-4-3 formation

const formation = [
    // Forwards
    ["Son Heung-Min", "Harry Kane", "Dejan Kulusevski"],

    // Midfield and wing-backs
    ["Ivan Perisic", "Pierre-Emile Hojbjerg",
        "Rodrigo Bentancur", "Richarlison"],

    // Defenders
    ["Ben Davies", "Eric Dier", "Cristian Romero"],

    // Goalkeeper
    ["Hugo Lloris"]
];

//Create football pitch formation
formation.forEach(function (row) {

    const formationRow = $("<div>")
        .addClass("formation-row");

    row.forEach(function (playerName) {

        //Find matching player from existing array
        const player = bestXI.find(
            p => p.name === playerName
        );

        if (!player) return;

        //Player button
        const playerButton = $("<button>")
            .addClass("pitch-player view-player")
            .attr("type", "button")
            .attr("data-player", player.search)
            .attr("aria-label",
                "View statistics for " + player.name);

        //Shirt symbol
        const shirt = $("<span>")
            .addClass("player-shirt")
            .text("⚽");

        //Player name
        const name = $("<span>")
            .addClass("pitch-player-name")
            .text(player.name);

        playerButton.append(shirt, name);
        formationRow.append(playerButton);

    });

    $("#bestXIGrid").append(formationRow);

});



//Search form
$("#playerForm").on("submit", function (event) {
    event.preventDefault();

    const playerName = $("#playerSelect").val();

    if (playerName) {
        fetchPlayer(playerName);
    }
});


$(document).on("click", ".view-player", function () {

    const searchName = $(this).data("player");

    //Find the full name for the dropdown
    const selectedPlayer = bestXI.find(
        player => player.search === searchName
    );

    if (selectedPlayer) {
        $("#playerSelect").val(selectedPlayer.name);
    }

    //Search the API using the shorter name
    fetchPlayer(searchName);

    document.getElementById("search")
        .scrollIntoView({ behavior: "smooth" });
});


//API request
async function fetchPlayer(playerName) {

    $("#playerResult").html(
        '<p class="text-muted">Loading player...</p>'
    );

    const url =
        "https://v3.football.api-sports.io/players" +
        "?team=" + TEAM_ID +
        "&season=" + SEASON +
        "&search=" + encodeURIComponent(playerName);

    try {
        const response = await fetch(url, {
            headers: {
                "x-apisports-key": API_KEY
            }
        });

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (data.errors &&
            Object.keys(data.errors).length > 0) {
            throw new Error("API returned an error");
        }

        if (!data.response || data.response.length === 0) {
            $("#playerResult").html(
                '<div class="alert alert-warning">' +
                'Player not found.</div>'
            );
            return;
        }

        const result = data.response[0];
        const player = result.player;
        const stats = result.statistics[0] || {};

        //Build elements using jQuery
        const container = $("<div>");

        $("<img>")
            .attr("src", player.photo)
            .attr("alt", player.name)
            .addClass("player-photo mb-3")
            .appendTo(container);

        $("<h4>")
            .text(player.name)
            .appendTo(container);

        const details = [
            ["Age", player.age],
            ["Nationality", player.nationality],
            ["Position", stats.games?.position],
            ["Appearances", stats.games?.appearences],
            ["Goals", stats.goals?.total],
            ["Assists", stats.goals?.assists]
        ];

        details.forEach(function ([label, value]) {
            $("<p>")
                .text(label + ": " + (value ?? "N/A"))
                .appendTo(container);
        });

        $("#playerResult").empty().append(container);

    } catch (error) {
        console.error(error);

        $("#playerResult").html(
            '<div class="alert alert-danger">' +
            'Unable to retrieve player information.' +
            '</div>'
        );
    }
}
