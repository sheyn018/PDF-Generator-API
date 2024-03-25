const express = require('express');
const { createWriteStream } = require('fs');
const { PDFDocument } = require('pdf-lib');
const svgToImg = require('svg-to-img');
const { rgb } = require('pdf-lib');
const axios = require('axios');

const app = express();

// Existing route handler
app.get("/", (req, res) => res.send("Express on Vercel"));

// New route handler for PDF generation
app.get("/generate-pdf", async (req, res) => {
    
    try {
        let { userName, firstUrl, secondUrl, thirdUrl, fourthUrl, fifthUrl, screenshotUrl, base64Image } = req.query;

        const firstSetUrls = [firstUrl, secondUrl, thirdUrl, fourthUrl, fifthUrl];

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage(); // Add a single page

        // Draw text on the page
        const textX = 50; // X position for text
        const textY = page.getHeight() - 50; // Y position for text
        const fontSize = 12; // Font size
        const fontColor = rgb(0, 0, 0); // Font color
        const font = await pdfDoc.embedFont('Helvetica'); // Font type

        // Add User Name
        page.drawText(`User Name: ${userName}`, {
            x: textX,
            y: textY,
            size: fontSize,
            font: font,
            color: fontColor,
        });

        // Add Date Generated
        const dateGenerated = new Date().toLocaleDateString(); // Get current date
        page.drawText(`Date Generated: ${dateGenerated}`, {
            x: textX,
            y: textY - 20,
            size: fontSize,
            font: font,
            color: fontColor,
        });

        const imageWidth = 90;
        const imageHeight = 100;

        // Calculate the total width required for images
        const totalWidth = firstSetUrls.length * (imageWidth + 20);
        const startingPosition = page.getWidth() / 2 - totalWidth / 2;
        let currentPosition = startingPosition;

        for (const url of firstSetUrls) {
            const response = await axios.get(url, { responseType: 'text' });
            const svgString = response.data;

            // Convert SVG to PNG
            const pngBuffer = await svgToImg.from(svgString).toPng();
            const image = await pdfDoc.embedPng(pngBuffer);

            // Draw the image on the page
            page.drawImage(image, {
                x: currentPosition + 10,
                y: page.getHeight() - imageHeight - 100,
                width: imageWidth,
                height: imageHeight,
            });

            currentPosition += imageWidth + 20;
        }

        // Fetch and embed the image from the second URL
        const screenshotResponse = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
        const screenshotImage = await pdfDoc.embedPng(screenshotResponse.data);
        const imageSize = screenshotImage.scale(0.5);
        const screenshotImageWidth = imageSize.width;
        const screenshotImageHeight = imageSize.height;
        const screenshotPosition = page.getWidth() / 2 - screenshotImageWidth / 2;

        // Draw the screenshot image on the page
        page.drawImage(screenshotImage, {
            x: screenshotPosition,
            y: currentPosition - 150,
            width: screenshotImageWidth,
            height: screenshotImageHeight,
        });

        // Decode base64 image if provided as a query parameter
        const base64Buffer = Buffer.from(base64Image.split(',')[1], 'base64');

        // Embed and draw the base64 image
        const base64ImageEmbed = await pdfDoc.embedJpg(base64Buffer);
        const base64ImageSize = base64ImageEmbed.scale(0.5);
        const base64ImageWidth = base64ImageSize.width;
        const base64ImageHeight = base64ImageSize.height;

        // Draw the base64 image on the page
        page.drawImage(base64ImageEmbed, {
            x: screenshotPosition + 30,
            y: currentPosition - base64ImageHeight - 130,
            width: base64ImageWidth,
            height: base64ImageHeight,
        });

        // Save the PDF to a file
        const pdfBytes = await pdfDoc.save();
        const pdfFileName = 'generated.pdf';
        const pdfStream = createWriteStream(pdfFileName);
        pdfStream.write(pdfBytes);
        pdfStream.end();

        // Send the generated PDF as the response
        res.setHeader('Content-Type', 'application/pdf');
        res.status(200).send(pdfBytes);
    }

    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(3001, () => console.log("Server ready on port 3001."));

module.exports = app;

