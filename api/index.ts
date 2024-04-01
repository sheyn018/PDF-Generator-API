const express = require('express');
const { createWriteStream } = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const svgToImg = require('svg-to-img');

const app = express();

// Existing route handler
app.get("/", (req, res) => res.send("Express on Vercel"));

// New route handler for PDF generation
app.get("/generate-pdf", async (req, res) => {
    try {
        const { userName, firstUrl, secondUrl, thirdUrl, fourthUrl, fifthUrl, screenshotUrl } = req.query;
        const firstSetUrls = [firstUrl, secondUrl, thirdUrl, fourthUrl, fifthUrl];

        // Create a new PDF document in landscape orientation
        const doc = new PDFDocument({ layout: 'landscape' });

        // Pipe the PDF to a writable stream
        const stream = doc.pipe(createWriteStream('landscape.pdf'));

        // Add User Name
        doc.fontSize(12).text(`User Name: ${userName}`, 50, 550);

        // Add Date Generated
        const dateGenerated = new Date().toLocaleDateString(); // Get current date
        doc.text(`Date Generated: ${dateGenerated}`, 50, 530);

        // Add images from URLs
        let currentPosition = 50;
        for (const url of firstSetUrls) {
            const response = await axios.get(url, { responseType: 'text' });
            const svgString = response.data;

            // Convert SVG to PNG
            const pngBuffer = await svgToImg.from(svgString).toPng();

            // Draw the image on the page
            doc.image(pngBuffer, currentPosition, 450, { width: 90, height: 100 });
            currentPosition += 110;
        }

        // Add screenshot image from URL
        const screenshotResponse = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
        const screenshotImage = screenshotResponse.data;

        // Draw the screenshot image on the page
        doc.image(screenshotImage, 50, 250, { width: 200 });
        
        // Finalize the document
        doc.end();

        // Wait for the PDF to be finished writing
        stream.on('finish', () => {
            // Send the PDF as response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="landscape.pdf"');
            res.download('landscape.pdf');
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(3001, () => console.log("Server ready on port 3001."));

module.exports = app;
