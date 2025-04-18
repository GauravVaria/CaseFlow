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
const addHearingBtn = document.getElementById('addHearingBtn');
const hearingForm = document.getElementById('hearingForm');
const saveHearingBtn = document.getElementById('saveHearingBtn');
const cancelHearingBtn = document.getElementById('cancelHearingBtn');
const hearingDate = document.getElementById('hearingDate');
const hearingDetails = document.getElementById('hearingDetails');
const hearingsTableBody = document.getElementById('hearingsTableBody');

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
addHearingBtn.addEventListener('click', () => {
    hearingForm.classList.remove('hidden');
    hearingDate.valueAsDate = new Date();
    hearingDetails.value = '';
});

cancelHearingBtn.addEventListener('click', () => {
    hearingForm.classList.add('hidden');
});

saveHearingBtn.addEventListener('click', saveHearing);

// Initial setup
toggleCaseNumber();
toggleCustomCourt();
toggleCustomAppearingFor();
toggleCustomPaymentMethod();
togglePartyB();

// Functions
function saveHearing() {
    const caseData = cases.find(c => c.id === currentCaseId);
    if (!caseData) return;

    if (!hearingDate.value || !hearingDetails.value) {
        alert('Please enter both date and details');
        return;
    }

    if (!caseData.hearings) {
        caseData.hearings = [];
    }

    caseData.hearings.push({
        date: hearingDate.value,
        details: hearingDetails.value,
        createdAt: new Date().toISOString()
    });

    saveCasesToCloud();
    renderHearingsTable(caseData);
    hearingForm.classList.add('hidden');
}

function renderHearingsTable(caseData) {
    hearingsTableBody.innerHTML = '';

    if (!caseData.hearings || caseData.hearings.length === 0) {
        hearingsTableBody.innerHTML = '<tr><td colspan="3">No hearings recorded</td></tr>';
        return;
    }

    // Sort hearings by date (newest first)
    const sortedHearings = [...caseData.hearings].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    sortedHearings.forEach((hearing, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hearing.date}</td>
            <td>${hearing.details}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-hearing" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        hearingsTableBody.appendChild(row);
    });

    // Add delete event listeners
    document.querySelectorAll('.delete-hearing').forEach(btn => {
        btn.addEventListener('click', function () {
            deleteHearing(this.dataset.index);
        });
    });
}

function deleteHearing(index) {
    const caseData = cases.find(c => c.id === currentCaseId);
    if (!caseData || !caseData.hearings) return;

    if (confirm('Are you sure you want to delete this hearing?')) {
        caseData.hearings.splice(index, 1);
        saveCasesToCloud();
        renderHearingsTable(caseData);
    }
}

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
    document.getElementById('detailBalance').textContent = `₹${calculateBalance(caseData)}`;
    document.getElementById('detailPaymentMethod').textContent = caseData.paymentMethod;
    document.getElementById('detailRemarks').textContent = caseData.remarks || 'N/A';
    document.getElementById('detailReference').textContent = caseData.reference || 'N/A';
    document.getElementById('detailTds').textContent = caseData.tds === 'yes' ? 'Yes' : 'No';

    renderInstallmentsTable(caseData);
    if (!caseData.hearings) {
        caseData.hearings = [];
    }
    renderHearingsTable(caseData);
}

function showGenerateInvoiceForm() {
    const caseData = cases.find(c => c.id === currentCaseId);
    if (!caseData) return;

    caseDetailView.classList.add('hidden');
    generateInvoiceForm.classList.remove('hidden');

    document.getElementById('invoiceCaseTitle').textContent = caseData.caseTitle;
    document.getElementById('remainingBalance').textContent = `₹${calculateBalance(caseData)}`;

    // Generate a simple invoice number based on date
    const now = new Date();
    document.getElementById('newInvoiceNumber').value = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;

    document.getElementById('newInvoiceDate').valueAsDate = now;
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
        paymentMethod: paymentMethodValue,
        remarks: document.getElementById('remarks').value,
        reference: document.getElementById('reference').value,
        tds: document.getElementById('tds').value,
        installments: getInstallmentsFromForm(),
        dateCreated: currentCaseId ? (cases.find(c => c.id === currentCaseId)?.dateCreated || new Date().toISOString()) : new Date().toISOString(),
        hearings: []
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
    const container = document.createElement('div');
    container.className = 'installment-container';

    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="form-group">
                    <label>Invoice Number</label>
                    <input type="text" class="installment-invoice" placeholder="INV-001">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" class="installment-date" min="${today}">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" class="installment-amount" min="0" step="0.01">
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-3">
                <div class="form-group">
                    <label>Payment Method</label>
                    <select class="installment-payment-method">
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="upi">UPI</option>
                        <option value="bank-transfer">Bank Transfer</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div class="col-md-3">
                <div class="form-group">
                    <label>Remarks</label>
                    <input type="text" class="installment-remarks" placeholder="Payment details">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-group">
                    <label class="checkbox-container">
                        <input type="checkbox" class="installment-received">
                        <span class="checkmark"></span>
                        Received
                    </label>
                </div>
            </div>
        </div>

        <div class="form-group custom-payment-group" style="display: none;">
            <label>Custom Payment Method</label>
            <input type="text" class="installment-custom-payment-method" placeholder="Specify payment method">
        </div>

        <div class="installment-actions">
            <button type="button" class="btn btn-danger remove-installment">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;

    installmentsContainer.appendChild(container);

    // Add event listeners
    container.querySelector('.remove-installment').addEventListener('click', function () {
        installmentsContainer.removeChild(container);
    });

    container.querySelector('.installment-payment-method').addEventListener('change', function () {
        const customInputGroup = container.querySelector('.custom-payment-group');
        customInputGroup.style.display = this.value === 'other' ? 'block' : 'none';
    });
}

function getInstallmentsFromForm() {
    const installments = [];
    const containers = document.querySelectorAll('.installment-container');

    containers.forEach(container => {
        const invoice = container.querySelector('.installment-invoice').value;
        const date = container.querySelector('.installment-date').value;
        const amount = parseFloat(container.querySelector('.installment-amount').value);
        const paymentMethodSelect = container.querySelector('.installment-payment-method');
        const customPaymentMethod = container.querySelector('.installment-custom-payment-method')?.value || '';
        const remarks = container.querySelector('.installment-remarks').value;
        const received = container.querySelector('.installment-received').checked;

        const paymentMethod = paymentMethodSelect.value === 'other'
            ? customPaymentMethod
            : paymentMethodSelect.value;

        if (date && amount) {
            installments.push({
                invoice,
                date,
                amount,
                paymentMethod,
                remarks,
                received
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

        // Format the date
        const createdDate = new Date(caseData.dateCreated);
        const formattedDate = createdDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td> <!-- New date column -->
            <td>${caseData.caseTitle}</td>
            <td>${caseData.caseNumber}</td>
            <td>${caseData.court}</td>
            <td>${caseData.appearingFor}</td>
            <td>₹${caseData.quotationAmount}</td>
            <td>₹${balance}</td>
            <td>${getStatusBadge(balance, caseData.quotationAmount)}</td>
            <td>
                <button class="btn view-case" data-id="${caseData.id}">View</button>
                <button class="btn edit-case" data-id="${caseData.id}">Edit</button>
                <button class="btn delete-case" data-id="${caseData.id}">Delete</button>
            </td>
        `;

        casesTableBody.appendChild(row);
    });

    // Add proper event listeners with proper 'this' binding
    document.querySelectorAll('.view-case').forEach(btn => {
        btn.addEventListener('click', function () {
            showCaseDetail(this.dataset.id);
        });
    });

    document.querySelectorAll('.edit-case').forEach(btn => {
        btn.addEventListener('click', function () {
            editCase(this.dataset.id);
        });
    });

    document.querySelectorAll('.delete-case').forEach(btn => {
        btn.addEventListener('click', function () {
            deleteCase(this.dataset.id);
        });
    });

    // Update totals
    totalCases.textContent = filteredCases.length;
    totalOutstanding.textContent = outstandingTotal.toFixed(2);

}

function formatDate(dateString) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return new Date(dateString).toLocaleString('en-IN', options);
}

// Then use it in renderCasesTable:
const formattedDate = formatDate(caseData.dateCreated);

function calculateBalance(caseData) {
    const quotationAmount = caseData.quotationAmount || 0;
    const receivedInstallmentsTotal = (caseData.installments || [])
        .filter(inst => inst.received) // Only count received installments
        .reduce((sum, inst) => sum + (inst.amount || 0), 0);
    return quotationAmount - receivedInstallmentsTotal;
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
        caseData.installments.forEach((installment) => {
            addInstallmentField();

            const containers = document.querySelectorAll('.installment-container');
            const lastContainer = containers[containers.length - 1];

            lastContainer.querySelector('.installment-date').value = installment.date;
            lastContainer.querySelector('.installment-amount').value = installment.amount;

            const paymentMethodSelect = lastContainer.querySelector('.installment-payment-method');
            if (installment.paymentMethod === 'cash' || installment.paymentMethod === 'upi') {
                paymentMethodSelect.value = installment.paymentMethod;
            } else {
                paymentMethodSelect.value = 'other';
                lastContainer.querySelector('.installment-custom-payment-method').value = installment.paymentMethod;
                lastContainer.querySelector('.custom-payment-group').style.display = 'block';
            }

            lastContainer.querySelector('.installment-received').checked = installment.received || false;
        });
    }

    const containers = document.querySelectorAll('.installment-container');
    containers.forEach((container, index) => {
        container.querySelector('.installment-received').addEventListener('change', function () {
            // Update the main cases array
            caseData.installments[index].received = this.checked;

            // Save changes
            saveCasesToCloud();

            // If the case details are open, sync the checkbox there
            if (!caseDetailView.classList.contains('hidden')) {
                const detailCheckbox = installmentsTableBody.querySelector(`tr[data-index="${index}"] .detail-installment-received`);
                if (detailCheckbox) {
                    detailCheckbox.checked = this.checked;
                    const statusCell = detailCheckbox.closest('tr').querySelector('td:nth-child(5)');
                    statusCell.textContent = this.checked ? 'Received' : 'Pending';
                    document.getElementById('detailBalance').textContent = `₹${calculateBalance(caseData)}`;
                }
            }
        });
    });

}

function deleteCase(caseId) {
    try {
        if (confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
            const index = cases.findIndex(c => c.id === caseId);

            if (index === -1) {
                throw new Error('Case not found');
            }

            cases.splice(index, 1);
            saveCasesToCloud();
            renderCasesTable();

            if (currentCaseId === caseId) {
                showViewCases();
                currentCaseId = null;
            }
        }
    } catch (error) {
        console.error('Error deleting case:', error);
        alert('Failed to delete case. Please try again.');
    }
}

function renderInstallmentsTable(caseData) {
    installmentsTableBody.innerHTML = '';

    if (!caseData.installments || caseData.installments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8">No installments recorded</td>';
        installmentsTableBody.appendChild(row);
        return;
    }

    caseData.installments.forEach((installment, index) => {
        const row = document.createElement('tr');
        row.dataset.index = index;

        row.innerHTML = `
            <td>${installment.invoice || 'N/A'}</td>
            <td>${installment.date}</td>
            <td>₹${installment.amount.toLocaleString('en-IN')}</td>
            <td>${installment.paymentMethod}</td>
            <td class="text-center">
                <label class="checkbox-container" title="${installment.received ? 'Mark as pending' : 'Mark as received'}">
                    <input type="checkbox" class="detail-installment-received" ${installment.received ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </td>
            <td class="${installment.received ? 'text-success' : 'text-warning'}">
                ${installment.received ? 'Received' : 'Pending'}
            </td>
            <td>${installment.remarks || 'N/A'}</td> <!-- Show remarks here -->
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger remove-installment" title="Remove installment">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;

        installmentsTableBody.appendChild(row);

        // Add event listener for the received checkbox
        row.querySelector('.detail-installment-received').addEventListener('change', function () {
            caseData.installments[index].received = this.checked;
            const statusCell = row.querySelector('td:nth-child(6)');
            statusCell.textContent = this.checked ? 'Received' : 'Pending';
            statusCell.className = this.checked ? 'text-success' : 'text-warning';
            document.getElementById('detailBalance').textContent = `₹${calculateBalance(caseData)}`;
            saveCasesToCloud();
            syncEditFormCheckbox(caseData.id, index, this.checked);
        });

        // Add event listener for remove button
        row.querySelector('.remove-installment').addEventListener('click', function () {
            if (confirm('Are you sure you want to remove this installment?')) {
                caseData.installments.splice(index, 1);
                saveCasesToCloud();
                renderInstallmentsTable(caseData);
                document.getElementById('detailBalance').textContent = `₹${calculateBalance(caseData)}`;
                if (document.getElementById('newCaseForm').classList.contains('hidden') === false) {
                    editCase(caseData.id);
                }
            }
        });
    });
}

function syncEditFormCheckbox(caseId, installmentIndex, isChecked) {
    // Only proceed if we're currently editing this case
    if (currentCaseId === caseId && !newCaseForm.classList.contains('hidden')) {
        const containers = document.querySelectorAll('.installment-container');
        if (containers[installmentIndex]) {
            containers[installmentIndex].querySelector('.installment-received').checked = isChecked;
        }
    }
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
    const newRemarks = document.getElementById('newRemarks').value; // Get remarks value

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
        paymentMethod,
        remarks: remarks, // Include remarks in the installment
        received: true // Assuming generated invoices are automatically marked as received
    });

    saveCasesToCloud();
    showCaseDetail(currentCaseId);
}

const CLIENT_ID = '302098980124-0rg1q7065lh9t24rq22h1ag584pp1de9.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let accessToken = null;
let currentUser = null;
let tokenClient = null;
let caseFileId = null;

const initGoogleAuth = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse,
    });

    showSignInPrompt();
};

const showSignInPrompt = () => {
    const overlay = document.createElement('div');
    overlay.id = 'signInOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255,255,255,0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      `;
    overlay.innerHTML = `
        <div style="text-align: center; padding: 20px; border-radius: 10px; background: white;">
          <h2>Legal Case Management System</h2>
          <p>Sign in with Google to store and manage your cases.</p>
          <button id="googleSignInBtn">Sign In with Google</button>
        </div>
      `;
    document.body.appendChild(overlay);
    document.getElementById('googleSignInBtn').addEventListener('click', () => {
        tokenClient.requestAccessToken();
    });
};

const handleTokenResponse = (response) => {
    if (response.error) return alert('Sign-in failed');
    accessToken = response.access_token;

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    })
        .then(res => res.json())
        .then(user => {
            currentUser = user;
            updateUIAfterSignIn(user);
            loadCasesFromCloud();
        });
};

const updateUIAfterSignIn = (user) => {
    document.getElementById('signInOverlay')?.remove();
    document.querySelector('.container').style.display = 'block';

    const header = document.querySelector('header');
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span>${user.name}</span>
        <button id="signOutBtn">Sign Out</button>
      `;
    header.appendChild(userInfo);
    document.getElementById('signOutBtn').addEventListener('click', signOut);
};

const signOut = () => {
    google.accounts.oauth2.revoke(accessToken, () => {
        accessToken = null;
        currentUser = null;
        document.querySelector('.user-info')?.remove();
        document.querySelector('.container').style.display = 'none';
        showSignInPrompt();
    });
};

const saveCasesToCloud = async (cases) => {
    const metadata = {
        name: 'cases.json',
        parents: ['appDataFolder'],
        mimeType: 'application/json',
    };

    const boundary = 'foo_bar_baz';
    const delimiter = `--${boundary}`;
    const closeDelim = `--${boundary}--`;

    const multipartRequestBody =
        `${delimiter}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n${delimiter}\r\nContent-Type: application/json\r\n\r\n` +
        JSON.stringify(cases) +
        `\r\n${closeDelim}`;

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (caseFileId) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${caseFileId}?uploadType=multipart`;
        method = 'PATCH';
    }

    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
    });

    const data = await res.json();
    caseFileId = data.id;
};

const loadCasesFromCloud = async () => {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='cases.json'+and+trashed=false+and+parents in 'appDataFolder'&spaces=appDataFolder&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const { files } = await res.json();

    if (files.length > 0) {
        caseFileId = files[0].id;

        const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${caseFileId}?alt=media`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const cases = await contentRes.json();
        renderCases(cases);
    }
};

const renderCases = (cases) => {
    const caseList = document.getElementById('caseList');
    caseList.innerHTML = '';
    cases.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'case';
        div.innerHTML = `<h3>${c.title}</h3><p>${c.description}</p>`;
        caseList.appendChild(div);
    });
};

document.getElementById('caseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const newCase = { title, description };

    const existing = Array.from(document.querySelectorAll('.case')).map(div => ({
        title: div.querySelector('h3').innerText,
        description: div.querySelector('p').innerText
    }));

    existing.push(newCase);
    renderCases(existing);
    await saveCasesToCloud(existing);

    document.getElementById('caseForm').reset();
});

document.addEventListener('DOMContentLoaded', initGoogleAuth);