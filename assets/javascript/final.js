$(document).ready(function () {
    let firebaseItineraryKey = GetURLParameter('itinerarykey');

    // helper function to send us to the index page when there is an unexpected error
    function returnToMainPageWithError(error) {
        // if the domain changes, this changes?!?!?!?!
        // i don't think you can replace with local files
        let url = 'https://tarose412.github.io/Travel-Route-Itinerary/index.html';
        error = encodeURIComponent(error);
        window.location.replace(`${url}?error=${error}`)
    }

    let snapshot = null;
    let waypoints = null;
    let attractions = null;
    let shareLink = null;

    let formContainer = $("#itineraryContainer");
    function initialize() {

        // we should have an itinerary key and we can pull the city data
        // from firebase else epic fail
        if (firebaseItineraryKey) {
            $("#itineraryKey").val(firebaseItineraryKey);

            shareLink = `https://tarose412.github.io/Travel-Route-Itinerary/final.html?itinerarykey=${firebaseItineraryKey}`;
            $("#shareableLink").text(shareLink);
            $("#shareableLink").attr("href", shareLink);


            database.ref(itineraryPath).child(firebaseItineraryKey).once('value').then(function (snapshot) {
                console.log(snapshot.val());
                snapshot = snapshot.val();
                waypoints = snapshot.waypoints;
                attractions = snapshot.attractions;

                for (let i = waypoints.length - 1; i >= 0; i--) {
                    let d = $("<div>");
                    d.append(`<h3>${waypoints[i].address}</h3>`);
                    if (attractions) {
                        console.log(attractions);
                        console.log(attractions[i]);
                        for (let j = 1; j < attractions[i].length; j++) {
                            d.append(`<h4>${attractions[i][j].name}</h4>`);
                            d.append(`<p>${attractions[i][j].address}</p>`);
                            d.append(`<p><a href="${attractions[i][j].website}" target="_blank">${attractions[i][j].website}</a></p>`);
                            d.append(`<p><a href="${attractions[i][j].googleMapsURL}" target="_blank">See in Google Maps</a></p>`);
                        }
                    }
                    formContainer.prepend(d);
                }
            });

            listenForFormSubmit();
        }
        else {
            console.log("Return to original page, no key found.");
            returnToMainPageWithError("noKey");
        }

    }
    initialize();



    function PDFDocument() {
        this.p = new jsPDF();
        this.currentLine = 10;
        this.linesPerPage = 275;
    }
    PDFDocument.prototype.checkIfNewPage = function () {
        if (this.currentLine > this.linesPerPage) {
            this.currentLine = 10;
            this.p.addPage();
        }
    }
    PDFDocument.prototype.printHeader = function (text) {
        this.checkIfNewPage();
        let font = 14;
        this.p.setFontSize(font);
        this.p.setFontType("bold");
        this.p.setTextColor(0,0,0);
        this.p.text(text, 5, this.currentLine);
        this.p.setFontType("normal");
        this.currentLine += font-4;
    }
    PDFDocument.prototype.printText = function (text) {
        this.checkIfNewPage();
        let font = 12;
        this.p.setTextColor(0,0,0);
        this.p.setFontSize(font);
        this.p.text(text, 10, this.currentLine);
        this.currentLine += font-2;
    }
    PDFDocument.prototype.printLink = function (link) {
        this.checkIfNewPage();
        let font = 12;
        this.p.setFontSize(font);
        this.p.setTextColor(0,0,255);
        this.p.textWithLink(link, 10, this.currentLine, { url: link });
        this.currentLine += font-2;
    }
    PDFDocument.prototype.save = function (name) {
        this.p.save(name + '.pdf');
    }




    // listen for form submit on itineraryContainer
    function listenForFormSubmit() {
        let pdf = new PDFDocument();

        // $("#itineraryContainer").on("submit", function (event) {
        formContainer.on("submit", function (event) {
            event.preventDefault();
            $("#itineraryKey").val(firebaseItineraryKey);

            pdf.printHeader("Road Rover");
            pdf.printLink(shareLink);

            for (let i = waypoints.length - 1; i >= 0; i--) {

                pdf.printHeader(waypoints[i].address);
                if (attractions) {
                    for (let j = 1; j < attractions[i].length; j++) {
                        pdf.printText(attractions[i][j].name);
                        pdf.printText(attractions[i][j].address);
                        if (attractions[i][j].phone) {
                            pdf.printText(attractions[i][j].phone);
                        }
                        if (attractions[i][j].website) {
                            pdf.printLink(attractions[i][j].website);
                        }
                        pdf.printLink(attractions[i][j].googleMapsURL);
                    }
                }
            }
            pdf.save("roadRoverItinerary");
        });
    }


});