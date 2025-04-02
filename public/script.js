// Global variables
let cases = JSON.parse(localStorage.getItem('legalCases')) || [];
let currentCaseId = null;

// DOM Elements
const newCaseBtn = document.getElementById('newCaseBtn');
const viewCasesBtn = document.getElementById('viewCasesBtn');
const newCaseForm = document.getElementById('newCaseForm');
const viewCases = document.getElementById('viewCases');
const caseDetailView = document.getElementById('caseDetailView');
const generateInvoiceForm = document.getElementById('generateInvoiceForm');
const caseForm = document.getElementById('caseForm');
const addInstallmentBtn = document.getElementById('addInstallmentBtn');
const installmentsContainer = document.getElementById('installmentsContainer');
const casesTableBody = document.getElementById('casesTableBody');
const sortBy = document.getElementById('sortBy');
const filterText = document.getElementById('filterText');
const dateRangeStart = document.getElementById('dateRangeStart');
const dateRangeEnd = document.getElementById('dateRangeEnd');
const totalCases = document.getElementById('totalCases');
const totalOutstanding = document.getElementById('totalOutstanding');
const caseNumberType = document.getElementById('caseNumberType');
const caseNumber = document.getElementById('caseNumber');
const court = document.getElementById('court');
const customCourt = document.getElementById('customCourt');
const appearingFor = document.getElementById('appearingFor');
const customAppearingFor = document.getElementById('customAppearingFor');
const paymentMethod = document.getElementById('paymentMethod');
const customPaymentMethod = document.getElementById('customPaymentMethod');
const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
const editCaseBtn = document.getElementById('editCaseBtn');
const backToListBtn = document.getElementById('backToListBtn');
const newInvoiceForm = document.getElementById('newInvoiceForm');
const cancelInvoiceBtn = document.getElementById('cancelInvoiceBtn');
const installmentsTableBody = document.getElementById('installmentsTableBody');
const caseType = document.getElementById('caseType');
const partyA = document.getElementById('partyA');
const partyB = document.getElementById('partyB');

// Event Listeners
newCaseBtn.addEventListener('click', showNewCaseForm);
viewCasesBtn.addEventListener('click', showViewCases);
caseForm.addEventListener('submit', createCase);
addInstallmentBtn.addEventListener('click', addInstallmentField);
sortBy.addEventListener('change', renderCasesTable);
filterText.addEventListener('input', renderCasesTable);
dateRangeStart.addEventListener('change', renderCasesTable);
dateRangeEnd.addEventListener('change', renderCasesTable);
caseNumberType.addEventListener('change', toggleCaseNumber);
court.addEventListener('change', toggleCustomCourt);
appearingFor.addEventListener('change', toggleCustomAppearingFor);
paymentMethod.addEventListener('change', toggleCustomPaymentMethod);
backToListBtn.addEventListener('click', showViewCases);
generateInvoiceBtn.addEventListener('click', showGenerateInvoiceForm);
newInvoiceForm.addEventListener('submit', generateNewInvoice);
cancelInvoiceBtn.addEventListener('click', () => {
    generateInvoiceForm.classList.add('hidden');
    caseDetailView.classList.remove('hidden');
});
caseType.addEventListener('change', togglePartyB);

// Initial setup
toggleCaseNumber();
toggleCustomCourt();
toggleCustomAppearingFor();
toggleCustomPaymentMethod();
togglePartyB();

// Functions
function showNewCaseForm() {
    newCaseForm.classList.remove('hidden');
    viewCases.classList.add('hidden');
    caseDetailView.classList.add('hidden');
    generateInvoiceForm.classList.add('hidden');
    newCaseBtn.classList.add('active');
    viewCasesBtn.classList.remove('active');
    caseForm.reset();
    installmentsContainer.innerHTML = '';
    currentCaseId = null;
}

function showViewCases() {
    newCaseForm.classList.add('hidden');
    viewCases.classList.remove('hidden');
    caseDetailView.classList.add('hidden');
    generateInvoiceForm.classList.add('hidden');
    newCaseBtn.classList.remove('active');
    viewCasesBtn.classList.add('active');
    renderCasesTable();
}

function showCaseDetail(caseId) {
    newCaseForm.classList.add('hidden');
    viewCases.classList.add('hidden');
    caseDetailView.classList.remove('hidden');
    generateInvoiceForm.classList.add('hidden');
    newCaseBtn.classList.remove('active');
    viewCasesBtn.classList.add('active');
    currentCaseId = caseId;

    const caseData = cases.find(c => c.id === caseId);
    if (!caseData) return;

    document.getElementById('detailCaseTitle').textContent = caseData.caseTitle;
    document.getElementById('detailCaseNumber').textContent = caseData.caseNumber;
    document.getElementById('detailCourt').textContent = caseData.court;
    document.getElementById('detailAppearingFor').textContent = caseData.appearingFor;
    document.getElementById('detailQuotationAmount').textContent = `₹${caseData.quotationAmount}`;
    document.getElementById('detailPerHearingFee').textContent = caseData.perHearingFee ? `₹${caseData.perHearingFee}` : 'N/A';
    document.getElementById('detailInvoiceNumber').textContent = caseData.invoiceNumber;
    document.getElementById('detailInvoiceDate').textContent = caseData.invoiceDate;
    document.getElementById('detailInvoiceAmount').textContent = `₹${caseData.invoiceAmount}`;
    document.getElementById('detailBalance').textContent = `₹${calculateBalance(caseData)}`;
    document.getElementById('detailPaymentMethod').textContent = caseData.paymentMethod;
    document.getElementById('detailRemarks').textContent = caseData.remarks || 'N/A';
    document.getElementById('detailReference').textContent = caseData.reference || 'N/A';
    document.getElementById('detailTds').textContent = caseData.tds === 'yes' ? 'Yes' : 'No';

    renderInstallmentsTable(caseData);
}

function showGenerateInvoiceForm() {
    const caseData = cases.find(c => c.id === currentCaseId);
    if (!caseData) return;

    caseDetailView.classList.add('hidden');
    generateInvoiceForm.classList.remove('hidden');

    document.getElementById('invoiceCaseTitle').textContent = caseData.caseTitle;
    document.getElementById('remainingBalance').textContent = calculateBalance(caseData);
    document.getElementById('newInvoiceNumber').value = generateNextInvoiceNumber(caseData.invoiceNumber);
    document.getElementById('newInvoiceDate').valueAsDate = new Date();
    document.getElementById('newInvoiceAmount').value = '';
    document.getElementById('newInvoiceAmount').max = calculateBalance(caseData);
    document.getElementById('newPaymentMethod').value = 'cash';
    document.getElementById('newCustomPaymentMethod').value = '';
    document.getElementById('newRemarks').value = '';

    toggleCustomPaymentMethod('new');
}

function createCase(e) {
    e.preventDefault();

    const caseTitle = `${partyA.value} ${caseType.value} ${caseType.value === 'only' ? '' : partyB.value}`.trim();
    const caseNumberValue = caseNumberType.value === 'custom' ? caseNumber.value : `${caseNumberType.value}-${Date.now().toString().slice(-6)}`;
    const courtValue = court.value === 'custom' ? customCourt.value : court.value;
    const appearingForValue = appearingFor.value === 'custom' ? customAppearingFor.value : appearingFor.value;
    const paymentMethodValue = paymentMethod.value === 'other' ? customPaymentMethod.value : paymentMethod.value;

    const newCase = {
        id: currentCaseId || Date.now().toString(),
        caseTitle,
        caseNumber: caseNumberValue,
        court: courtValue,
        appearingFor: appearingForValue,
        quotationAmount: parseFloat(document.getElementById('quotationAmount').value),
        perHearingFee: document.getElementById('perHearingFee').value ? parseFloat(document.getElementById('perHearingFee').value) : null,
        invoiceNumber: document.getElementById('invoiceNumber').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        invoiceAmount: parseFloat(document.getElementById('invoiceAmount').value),
        paymentMethod: paymentMethodValue,
        remarks: document.getElementById('remarks').value,
        reference: document.getElementById('reference').value,
        tds: document.getElementById('tds').value,
        installments: getInstallmentsFromForm(),
        dateCreated: currentCaseId ? (cases.find(c => c.id === currentCaseId)?.dateCreated || new Date().toISOString()) : new Date().toISOString()
    };

    if (currentCaseId) {
        const index = cases.findIndex(c => c.id === currentCaseId);
        if (index !== -1) {
            cases[index] = newCase;
        }
    } else {
        cases.push(newCase);
    }

    saveCasesToCloud();
    showViewCases();
}

function addInstallmentField() {
    const installmentIndex = document.querySelectorAll('.installment-container').length;
    const container = document.createElement('div');
    container.className = 'installment-container';
    container.dataset.index = installmentIndex;

    container.innerHTML = `
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="installmentInvoice${installmentIndex}">Invoice Number</label>
                    <input type="text" id="installmentInvoice${installmentIndex}" class="installment-invoice">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="installmentDate${installmentIndex}">Date</label>
                    <input type="date" id="installmentDate${installmentIndex}" class="installment-date">
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="installmentAmount${installmentIndex}">Amount (₹)</label>
                    <input type="number" id="installmentAmount${installmentIndex}" min="0" class="installment-amount">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="installmentPaymentMethod${installmentIndex}">Payment Method</label>
                    <select id="installmentPaymentMethod${installmentIndex}" class="installment-payment-method">
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="installmentCustomPaymentMethod${installmentIndex}">Custom Payment Method</label>
            <input type="text" id="installmentCustomPaymentMethod${installmentIndex}" class="installment-custom-payment-method" placeholder="Enter custom payment method">
        </div>

        <div class="installment-actions">
            <button type="button" class="btn-danger remove-installment">Remove</button>
        </div>
    `;

    installmentsContainer.appendChild(container);

    container.querySelector('.remove-installment').addEventListener('click', function () {
        installmentsContainer.removeChild(container);
    });

    container.querySelector('.installment-payment-method').addEventListener('change', function () {
        const customInput = container.querySelector('.installment-custom-payment-method');
        customInput.style.display = this.value === 'other' ? 'block' : 'none';
    });

    // Initialize custom payment method visibility
    container.querySelector('.installment-custom-payment-method').style.display = 'none';
}

function getInstallmentsFromForm() {
    const installments = [];
    const containers = document.querySelectorAll('.installment-container');

    containers.forEach(container => {
        const index = container.dataset.index;
        const invoice = document.getElementById(`installmentInvoice${index}`).value;
        const date = document.getElementById(`installmentDate${index}`).value;
        const amount = parseFloat(document.getElementById(`installmentAmount${index}`).value);
        const paymentMethodSelect = document.getElementById(`installmentPaymentMethod${index}`);
        const customPaymentMethod = document.getElementById(`installmentCustomPaymentMethod${index}`).value;

        const paymentMethod = paymentMethodSelect.value === 'other'
            ? customPaymentMethod
            : paymentMethodSelect.value;

        if (invoice && date && amount) {
            installments.push({
                invoice,
                date,
                amount,
                paymentMethod
            });
        }
    });

    return installments;
}

function renderCasesTable() {
    const sortField = sortBy.value;
    const search = filterText.value.toLowerCase();
    const startDate = dateRangeStart.value ? new Date(dateRangeStart.value) : null;
    const endDate = dateRangeEnd.value ? new Date(dateRangeEnd.value) : null;

    let filteredCases = [...cases];

    // Apply search filter
    if (search) {
        filteredCases = filteredCases.filter(c =>
            c.caseTitle.toLowerCase().includes(search) ||
            c.caseNumber.toLowerCase().includes(search) ||
            c.court.toLowerCase().includes(search) ||
            c.appearingFor.toLowerCase().includes(search)
        );
    }

    // Apply date filter
    if (startDate) {
        filteredCases = filteredCases.filter(c => new Date(c.dateCreated) >= startDate);
    }

    if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        filteredCases = filteredCases.filter(c => new Date(c.dateCreated) < nextDay);
    }

    // Sort cases
    filteredCases.sort((a, b) => {
        if (sortField === 'dateCreated') {
            return new Date(b.dateCreated) - new Date(a.dateCreated);
        } else if (sortField === 'balanceRemaining') {
            return calculateBalance(b) - calculateBalance(a);
        } else if (sortField === 'caseTitle') {
            return a.caseTitle.localeCompare(b.caseTitle);
        }
        return 0;
    });

    // Clear table
    casesTableBody.innerHTML = '';

    // Calculate totals
    let outstandingTotal = 0;

    // Render table rows
    filteredCases.forEach(caseData => {
        const balance = calculateBalance(caseData);
        outstandingTotal += balance;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${caseData.caseTitle}</td>
            <td>${caseData.caseNumber}</td>
            <td>${caseData.court}</td>
            <td>${caseData.appearingFor}</td>
            <td>₹${caseData.quotationAmount}</td>
            <td>₹${balance}</td>
            <td>${getStatusBadge(balance, caseData.quotationAmount)}</td>
            <td>
                <button class="view-case" data-id="${caseData.id}">View</button>
                <button class="edit-case" data-id="${caseData.id}">Edit</button>
                <button class="delete-case" data-id="${caseData.id}">Delete</button>
            </td>
        `;

        casesTableBody.appendChild(row);
    });

    // Add event listeners to the newly created buttons
    document.querySelectorAll('.view-case').forEach(btn => {
        btn.addEventListener('click', () => showCaseDetail(btn.dataset.id));
    });

    document.querySelectorAll('.edit-case').forEach(btn => {
        btn.addEventListener('click', () => editCase(btn.dataset.id));
    });

    document.querySelectorAll('.delete-case').forEach(btn => {
        btn.addEventListener('click', () => deleteCase(btn.dataset.id));
    });

    // Update totals
    totalCases.textContent = filteredCases.length;
    totalOutstanding.textContent = outstandingTotal.toFixed(2);
}

function calculateBalance(caseData) {
    const invoiceAmount = caseData.invoiceAmount || 0;
    const installmentsTotal = (caseData.installments || []).reduce((sum, inst) => sum + (inst.amount || 0), 0);
    return invoiceAmount - installmentsTotal;
}

function getStatusBadge(balance, quotation) {
    const ratio = balance / quotation;

    if (balance === 0) {
        return `<span class="badge badge-success">Paid</span>`;
    } else if (ratio < 0.3) {
        return `<span class="badge badge-success">Almost Paid</span>`;
    } else if (ratio < 0.7) {
        return `<span class="badge badge-warning">Partially Paid</span>`;
    } else {
        return `<span class="badge badge-danger">Unpaid</span>`;
    }
}

function toggleCaseNumber() {
    caseNumber.disabled = caseNumberType.value !== 'custom';
    if (caseNumberType.value !== 'custom') {
        caseNumber.value = '';
    }
}

function toggleCustomCourt() {
    customCourt.disabled = court.value !== 'custom';
    if (court.value !== 'custom') {
        customCourt.value = '';
    }
}

function toggleCustomAppearingFor() {
    customAppearingFor.disabled = appearingFor.value !== 'custom';
    if (appearingFor.value !== 'custom') {
        customAppearingFor.value = '';
    }
}

function toggleCustomPaymentMethod(prefix = '') {
    const methodSelect = prefix ? document.getElementById(`${prefix}PaymentMethod`) : paymentMethod;
    const customInput = prefix ? document.getElementById(`${prefix}CustomPaymentMethod`) : customPaymentMethod;

    customInput.disabled = methodSelect.value !== 'other';
    if (methodSelect.value !== 'other') {
        customInput.value = '';
    }
}

function togglePartyB() {
    partyB.disabled = caseType.value === 'only';
    if (caseType.value === 'only') {
        partyB.value = '';
    }
}

function editCase(caseId) {
    const caseData = cases.find(c => c.id === caseId);
    if (!caseData) return;

    currentCaseId = caseId;

    // Switch to new case form
    newCaseBtn.classList.add('active');
    viewCasesBtn.classList.remove('active');
    newCaseForm.classList.remove('hidden');
    viewCases.classList.add('hidden');
    caseDetailView.classList.add('hidden');

    // Set form values
    const titleParts = caseData.caseTitle.split(' ');
    if (titleParts.includes('vs')) {
        partyA.value = titleParts[0];
        caseType.value = 'vs';
        partyB.value = titleParts[2] || '';
    } else {
        partyA.value = titleParts[0];
        caseType.value = 'only';
        partyB.value = '';
    }

    // Handle case number
    if (caseData.caseNumber.startsWith('legal-notice-') ||
        caseData.caseNumber.startsWith('affidavit-')) {
        caseNumberType.value = caseData.caseNumber.split('-')[0];
        caseNumber.value = '';
    } else {
        caseNumberType.value = 'custom';
        caseNumber.value = caseData.caseNumber;
    }

    // Handle court
    const standardCourts = ['high-court', 'civil-court', 'consumer-court', 'family-court'];
    if (standardCourts.includes(caseData.court)) {
        court.value = caseData.court;
        customCourt.value = '';
    } else {
        court.value = 'custom';
        customCourt.value = caseData.court;
    }

    // Handle appearing for
    if (caseData.appearingFor === 'Party A' || caseData.appearingFor === 'Party B') {
        appearingFor.value = caseData.appearingFor === 'Party A' ? 'partyA' : 'partyB';
        customAppearingFor.value = '';
    } else {
        appearingFor.value = 'custom';
        customAppearingFor.value = caseData.appearingFor;
    }

    // Set other fields
    document.getElementById('quotationAmount').value = caseData.quotationAmount;
    document.getElementById('perHearingFee').value = caseData.perHearingFee || '';
    document.getElementById('invoiceNumber').value = caseData.invoiceNumber;
    document.getElementById('invoiceDate').value = caseData.invoiceDate;
    document.getElementById('invoiceAmount').value = caseData.invoiceAmount;

    // Handle payment method
    if (caseData.paymentMethod === 'cash' || caseData.paymentMethod === 'upi') {
        paymentMethod.value = caseData.paymentMethod;
        customPaymentMethod.value = '';
    } else {
        paymentMethod.value = 'other';
        customPaymentMethod.value = caseData.paymentMethod;
    }

    document.getElementById('remarks').value = caseData.remarks || '';
    document.getElementById('reference').value = caseData.reference || '';
    document.getElementById('tds').value = caseData.tds || 'no';

    // Update UI based on selections
    toggleCaseNumber();
    toggleCustomCourt();
    toggleCustomAppearingFor();
    toggleCustomPaymentMethod();
    togglePartyB();

    // Handle installments
    installmentsContainer.innerHTML = '';
    if (caseData.installments && caseData.installments.length > 0) {
        caseData.installments.forEach((installment, index) => {
            addInstallmentField();

            // Set values for the newly added installment
            document.getElementById(`installmentInvoice${index}`).value = installment.invoice;
            document.getElementById(`installmentDate${index}`).value = installment.date;
            document.getElementById(`installmentAmount${index}`).value = installment.amount;

            const paymentMethodElem = document.getElementById(`installmentPaymentMethod${index}`);
            const customPaymentMethodElem = document.getElementById(`installmentCustomPaymentMethod${index}`);

            if (installment.paymentMethod === 'cash' || installment.paymentMethod === 'upi') {
                paymentMethodElem.value = installment.paymentMethod;
                customPaymentMethodElem.value = '';
                customPaymentMethodElem.style.display = 'none';
            } else {
                paymentMethodElem.value = 'other';
                customPaymentMethodElem.value = installment.paymentMethod;
                customPaymentMethodElem.style.display = 'block';
            }
        });
    }
}

function deleteCase(caseId) {
    if (confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
        cases = cases.filter(c => c.id !== caseId);
        saveCasesToCloud();
        renderCasesTable();
    }
}

function renderInstallmentsTable(caseData) {
    installmentsTableBody.innerHTML = '';

    if (!caseData.installments || caseData.installments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">No installments recorded</td>';
        installmentsTableBody.appendChild(row);
        return;
    }

    caseData.installments.forEach(installment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${installment.invoice}</td>
            <td>${installment.date}</td>
            <td>₹${installment.amount}</td>
            <td>${installment.paymentMethod}</td>
        `;
        installmentsTableBody.appendChild(row);
    });
}

function generateNextInvoiceNumber(previousInvoice) {
    // Extract numeric part of invoice number and increment
    const regex = /(\D*)(\d+)(\D*)/;
    const match = previousInvoice.match(regex);

    if (match) {
        const prefix = match[1] || '';
        const number = parseInt(match[2]);
        const suffix = match[3] || '';

        return `${prefix}${(number + 1).toString().padStart(match[2].length, '0')}${suffix}`;
    }

    // If no pattern found, just append "/2"
    return `${previousInvoice}/2`;
}

function generateNewInvoice(e) {
    e.preventDefault();

    const caseData = cases.find(c => c.id === currentCaseId);
    if (!caseData) return;

    const invoiceNumber = document.getElementById('newInvoiceNumber').value;
    const invoiceDate = document.getElementById('newInvoiceDate').value;
    const invoiceAmount = parseFloat(document.getElementById('newInvoiceAmount').value);
    const paymentMethodElem = document.getElementById('newPaymentMethod');
    const customPaymentMethodElem = document.getElementById('newCustomPaymentMethod');
    const remarks = document.getElementById('newRemarks').value;

    const paymentMethod = paymentMethodElem.value === 'other'
        ? customPaymentMethodElem.value
        : paymentMethodElem.value;

    if (!caseData.installments) {
        caseData.installments = [];
    }

    caseData.installments.push({
        invoice: invoiceNumber,
        date: invoiceDate,
        amount: invoiceAmount,
        paymentMethod
    });

    saveCasesToCloud();
    showCaseDetail(currentCaseId);
}

// Google Auth Integration
let auth2;
let isSignedIn = false;
let currentUser = null;

// Function to initialize the Google API client
function initGoogleAuth() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            clientId: '302098980124-0rg1q7065lh9t24rq22h1ag584pp1de9.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/drive.appdata',
            plugin_name: 'CaseFlow'
        }).then(() => {
            auth2 = gapi.auth2.getAuthInstance();
            isSignedIn = auth2.isSignedIn.get();

            // Update UI based on sign-in state
            updateSignInStatus(isSignedIn);

            // Listen for sign-in state changes
            auth2.isSignedIn.listen(updateSignInStatus);

            // Handle the initial sign-in state
            if (isSignedIn) {
                currentUser = auth2.currentUser.get();
                loadCasesFromCloud();
            } else {
                showSignInPrompt();
            }
        }).catch(error => {
            console.error('Error initializing Google API client:', error);
        });
    });
}
function showLoading(show) {
    const loader = document.getElementById('loader') ||
        document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = 'Loading...';
    loader.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:yellow;padding:10px;z-index:1000;';
    if (show) {
        document.body.appendChild(loader);
    } else {
        document.getElementById('loader')?.remove();
    }
}
// Function to update UI based on sign-in state
function updateSignInStatus(isSignedIn) {
    const container = document.querySelector('.container');

    if (isSignedIn) {
        // User is signed in
        document.getElementById('signInOverlay')?.remove();
        container.style.display = 'block';

        currentUser = auth2.currentUser.get();
        const profile = currentUser.getBasicProfile();

        // Update user info in the header
        const header = document.querySelector('header');
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <span>${profile.getName()}</span>
            <button id="signOutBtn">Sign Out</button>
        `;

        if (!document.querySelector('.user-info')) {
            header.appendChild(userInfo);
        }

        document.getElementById('signOutBtn')?.addEventListener('click', signOut);

        // Load cases from Google Drive
        loadCasesFromCloud();
    } else {
        // User is signed out
        container.style.display = 'none';

        // Show sign-in prompt
        showSignInPrompt();
    }
}

// Function to show sign-in prompt
function showSignInPrompt() {
    // Remove existing overlay if it exists
    document.getElementById('signInOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'signInOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    overlay.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
            <h2 style="margin-bottom: 20px; color: var(--primary);">Legal Case Management System</h2>
            <p style="margin-bottom: 30px;">Sign in with your Google account to securely store and manage your legal cases.</p>
            <div id="googleSignInButton"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Render the Google Sign-In button
    gapi.signin2.render('googleSignInButton', {
        'scope': 'https://www.googleapis.com/auth/drive.appdata',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSignIn,
        'onfailure': onSignInFailure
    });
}

// Function called when sign-in is successful
function onSignIn(googleUser) {
    currentUser = googleUser;
    isSignedIn = true;
    updateSignInStatus(true);
}

// Function called when sign-in fails
function onSignInFailure(error) {
    console.error('Google Sign-In error:', error);
    alert('Sign-in failed. Please try again.');
}

// Function to sign out
function signOut() {
    if (auth2) {
        auth2.signOut().then(() => {
            isSignedIn = false;
            currentUser = null;
            updateSignInStatus(false);
        });
    }
}

// Function to save cases to Google Drive
function saveCasesToCloud() {
    if (!isSignedIn || !currentUser) {
        // Save to localStorage as fallback
        localStorage.setItem('legalCases', JSON.stringify(cases));
        return;
    }

    // Also update localStorage as backup
    localStorage.setItem('legalCases', JSON.stringify(cases));

    // Save to Google Drive AppData folder
    gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name = 'legal_cases.json'"
    }).then(response => {
        const files = response.result.files;
        const casesJson = JSON.stringify(cases);

        if (files && files.length > 0) {
            // Update existing file
            const fileId = files[0].id;

            const metadata = {
                mimeType: 'application/json'
            };

            const blob = new Blob([casesJson], { type: 'application/json' });
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
                method: 'PATCH',
                headers: new Headers({
                    'Authorization': 'Bearer ' + currentUser.getAuthResponse().access_token
                }),
                body: form
            }).catch(error => {
                console.error('Error updating file:', error);
            });
        } else {
            // Create new file
            const metadata = {
                name: 'legal_cases.json',
                mimeType: 'application/json',
                parents: ['appDataFolder']
            };

            const blob = new Blob([casesJson], { type: 'application/json' });
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({
                    'Authorization': 'Bearer ' + currentUser.getAuthResponse().access_token
                }),
                body: form
            }).catch(error => {
                console.error('Error creating file:', error);
            });
        }
    }).catch(error => {
        console.error('Error accessing Google Drive:', error);
    });
}

// Function to load cases from Google Drive
function loadCasesFromCloud() {
    if (!isSignedIn || !currentUser) {
        // Load from localStorage as fallback
        cases = JSON.parse(localStorage.getItem('legalCases')) || [];
        renderCasesTable();
        return;
    }

    gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name = 'legal_cases.json'"
    }).then(response => {
        const files = response.result.files;

        if (files && files.length > 0) {
            const fileId = files[0].id;

            gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            }).then(response => {
                cases = response.result || [];
                renderCasesTable();
            }).catch(error => {
                console.error('Error loading file content:', error);
                // Fall back to localStorage
                cases = JSON.parse(localStorage.getItem('legalCases')) || [];
                renderCasesTable();
            });
        } else {
            // No file found, try localStorage
            cases = JSON.parse(localStorage.getItem('legalCases')) || [];
            renderCasesTable();
        }
    }).catch(error => {
        console.error('Error accessing Google Drive:', error);
        // Fall back to localStorage
        cases = JSON.parse(localStorage.getItem('legalCases')) || [];
        renderCasesTable();
    });
}

// Load Google API client library
function loadGoogleApi() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
        initGoogleAuth();
    };
    document.body.appendChild(script);
}

// Add styles for sign-in overlay
function addGoogleSignInStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .user-info {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            color: white;
        }

        .user-info span {
            margin-right: 10px;
        }

        #signOutBtn {
            background-color: #d9534f;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }

        #signOutBtn:hover {
            background-color: #c9302c;
        }
    `;
    document.head.appendChild(style);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    addGoogleSignInStyles();
    loadGoogleApi();
});