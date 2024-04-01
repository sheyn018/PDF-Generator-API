const express = require('express');
const { createWriteStream } = require('fs');
const PDFDocument = require('pdfkit');

const app = express();

// Existing route handler
app.get("/", (req, res) => res.send("Express on Vercel"));

// New route handler for PDF generation
app.get("/generate-pdf", async (req, res) => {
    try {
        // Create a new PDF document
        const doc = new PDFDocument({ layout: 'landscape' });

        // Pipe the PDF to a writable stream
        const stream = doc.pipe(createWriteStream('landscape.pdf'));

        // Add text to the document
        doc.text('This is a landscape PDF!', 100, 100);

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
