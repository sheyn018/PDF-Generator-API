const express = require('express');
const { createWriteStream } = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const svgToImg = require('svg-to-img');
const nodemailer = require('nodemailer');
const { join } = require('path');
const { tmpdir } = require('os');

const app = express();



// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sheane39@gmail.com',
        pass: 'gxqi seqf gjyz kkmj'
    }
});

// Existing route handler
app.get("/", (req, res) => res.send("Express on Vercel"));

// New route handler for PDF generation
app.get("/generate-pdf", async (req, res) => {
    try {
        let { userName, businessName, industry, targetAudience, visualPreference, keyMessage, designElements,
            firstUrl, secondUrl, thirdUrl, fourthUrl, fifthUrl, 
            firstRGB, secondRGB, thirdRGB, fourthRGB, fifthRGB,
            firstHex, secondHex, thirdHex, fourthHex, fifthHex,
            firstCMYK, secondCMYK, thirdCMYK, fourthCMYK, fifthCMYK,
            screenshotUrl } = req.query;
        
        userName = decodeURIComponent(userName);
        firstRGB = decodeURIComponent(firstRGB);
        secondRGB = decodeURIComponent(secondRGB);
        thirdRGB = decodeURIComponent(thirdRGB);
        fourthRGB = decodeURIComponent(fourthRGB);
        fifthRGB = decodeURIComponent(fifthRGB);
        firstCMYK = decodeURIComponent(firstCMYK);
        secondCMYK = decodeURIComponent(secondCMYK);
        thirdCMYK = decodeURIComponent(thirdCMYK);
        fourthCMYK = decodeURIComponent(fourthCMYK);
        fifthCMYK = decodeURIComponent(fifthCMYK);

        const urlSet = [firstUrl, secondUrl, thirdUrl, fourthUrl, fifthUrl];
        const rgbSet = [firstRGB, secondRGB, thirdRGB, fourthRGB, fifthRGB];
        const hexSet = [firstHex, secondHex, thirdHex, fourthHex, fifthHex];
        const cmykSet = [firstCMYK, secondCMYK, thirdCMYK, fourthCMYK, fifthCMYK];

        // Create a new PDF document in landscape orientation
        const doc = new PDFDocument({ layout: 'landscape' });
        
        // Pipe the PDF to a writable stream in /tmp directory
        const pdfPath = join(tmpdir(), 'landscape.pdf');
        const stream = doc.pipe(createWriteStream(pdfPath));

        // Add User Name
        doc.fontSize(12).text(`User Name: ${userName}`, 50, 50);

        // Add Date Generated
        const dateGenerated = new Date().toLocaleDateString();
        doc.text(`Date Generated: ${dateGenerated}`, 550, 50);

        // Add "Typography" header
        doc.font('Helvetica-Bold').text('TYPOGRAPHY', 50, 90, { continued: true, width: 200, align: 'left' });

        // Add screenshot image from URL
        const screenshotResponse = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
        const screenshotImage = screenshotResponse.data;

        // Draw the screenshot image on the page
        doc.image(screenshotImage, 50, 120, { width: 300 });
        
        // Add business details
        doc.font('Helvetica').fontSize(10)
        .text('')
        .text(`Business Name: ${businessName}`, 50, 430)
        .text(`Industry: ${industry}`, 50, 445)
        .text(`Target Audience: ${targetAudience}`, 50, 460)
        .text(`Visual Preference: ${visualPreference}`, 50, 475)
        .text(`Key Message: ${keyMessage}`, 50, 490)
        .text(`Design Elements: ${designElements}`, 50, 505);

        // Add "Color Palette" header
        doc.font('Helvetica-Bold').text('COLOR PALETTE', 350, 90, { continued: true, width: 200, align: 'right' });

        // Add images from URLs on the right side
        let currentPosition = 120; // Start position vertically
        const textXCoordinate = 530; // X-coordinate for text
        let index = 0;
        for (const url of urlSet) {
            const response = await axios.get(url, { responseType: 'text' });
            const svgString = response.data;

            // Convert SVG to PNG
            const pngBuffer = await svgToImg.from(svgString).toPng();

            // Draw the image on the right side
            doc.image(pngBuffer, 450, currentPosition, { width: 70, height: 70 });

            // Add text next to the image
            const hexValue = hexSet[index];
            const rgbValue = rgbSet[index];
            const cmykValue = cmykSet[index];

            doc.fontSize(10)
            .text('')
            .text(`HEX: ${hexValue}`, textXCoordinate, currentPosition + 7)
            .text(`RGB: ${rgbValue}`, textXCoordinate, currentPosition + 17)
            .text(`CMYK: ${cmykValue}`, textXCoordinate, currentPosition + 27);

            currentPosition += 95; // Increment vertical position
            index++;
        }
        
        // Finalize the document
        doc.end();

        /// Wait for the PDF to be finished writing
        stream.on('finish', async () => {
            try {
                // Send the PDF as attachment via email
                const info = await transporter.sendMail({
                    from: 'sheane39@gmail.com',
                    to: 'sheanemtolentino@gmail.com',
                    subject: 'Your PDF Report',
                    text: 'Please find the PDF attached.',
                    attachments: [
                        {
                            filename: 'landscape.pdf',
                            path: pdfPath
                        }
                    ]
                });
                
                console.log('Email sent:', info.response);
                res.status(200).send('PDF emailed successfully');
            } catch (error) {
                console.error('Error sending email:', error);
                res.status(500).send('Error sending email');
            }
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(3001, () => console.log("Server ready on port 3001."));

module.exports = app;