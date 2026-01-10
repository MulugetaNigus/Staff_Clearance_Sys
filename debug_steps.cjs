const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'Backend/config.env') });

const MONGODB_URI = "https://staffclearancesys.onrender.com/api";

async function debugSteps() {
    try {
        await mongoose.connect(MONGODB_URI);
        const ClearanceStep = mongoose.model('ClearanceStep', new mongoose.Schema({}, { strict: false }));
        const ClearanceRequest = mongoose.model('ClearanceRequest', new mongoose.Schema({}, { strict: false }));

        const request = await ClearanceRequest.findOne().sort({ createdAt: -1 });
        if (!request) {
            console.log('No requests found');
            return;
        }

        console.log('Request ID:', request._id);
        console.log('Request Status:', request.status);

        const steps = await ClearanceStep.find({ requestId: request._id }).sort({ order: 1 });
        console.log('Total Steps:', steps.length);

        steps.forEach(s => {
            console.log(`Order: ${s.order}, Role: ${s.reviewerRole}, Status: ${s.status}, vpSignatureType: ${s.vpSignatureType}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

debugSteps();
