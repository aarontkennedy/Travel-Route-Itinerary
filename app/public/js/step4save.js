$(document).ready(function () {

    let shareLink = $("#itineraryLink");
    let betterAddress = window.location.protocol +
        "//" +
        window.location.host +
        shareLink.text().trim();
    shareLink.text(betterAddress);
    shareLink.attr("href", betterAddress);

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
        if (text) {
            this.checkIfNewPage();
            let font = 14;
            this.p.setFontSize(font);
            this.p.setFontType("bold");
            this.p.setTextColor(0, 0, 0);
            this.p.text(text, 5, this.currentLine);
            this.p.setFontType("normal");
            this.currentLine += font - 4;
        }
    }
    PDFDocument.prototype.printText = function (text) {
        if (text) {
            this.checkIfNewPage();
            let font = 12;
            this.p.setTextColor(0, 0, 0);
            this.p.setFontSize(font);
            this.p.text(text, 10, this.currentLine);
            this.currentLine += font - 2;
        }
    }
    PDFDocument.prototype.printLink = function (link) {
        if (link) {
            this.checkIfNewPage();
            let font = 12;
            this.p.setFontSize(font);
            this.p.setTextColor(0, 0, 255);
            this.p.textWithLink(link, 10, this.currentLine, { url: link });
            this.currentLine += font - 2;
        }
    }
    PDFDocument.prototype.save = function (name) {
        this.p.save(name + '.pdf');
    }



    // listen for PDF request
    function listenForPDFrequest() {
        let pdf = new PDFDocument();

        // $("#itineraryContainer").on("submit", function (event) {
        $("#saveAsPDF").on("click", function (event) {
            event.preventDefault();

            pdf.printHeader("Road Rover");
            pdf.printHeader($("#itineraryName").text());
            pdf.printLink(shareLink.text());

            let waypoints = $(".waypoint");

            for (let i = 0; i < waypoints.length; i++) {
                let w = $(waypoints[i]);

                pdf.printHeader(w.children(".waypointTitle").text());

                let attractions = w.children(".attraction");
                if (attractions) {
                    for (let j = 0; j < attractions.length; j++) {
                        let a = $(attractions[j]);
                        pdf.printText($(a.children(".attractionTitle")).text());

                        pdf.printText($(a.find(".attractionPhone")).text());

                        pdf.printText($(a.find(".attractionLink")).text());
                        pdf.printLink($(a.find(".attractionLink")).attr("href"));

                        pdf.printLink($(a.find(".attractionWebsite")).text());
                    }
                }
            }
            pdf.save("roadRoverItinerary");
        });
    }
    listenForPDFrequest();

});