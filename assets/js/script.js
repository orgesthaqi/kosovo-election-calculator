// Configuration
const THRESHOLD = 5;
const DHONDT_SEATS = 100;
const RESERVED_SEATS = 20;
const PARTIES = ['LVV', 'LDK', 'PDK', 'AAK', 'NISMA'];

// Initialize the table
function initializeTable() {
    const tableBody = document.getElementById('partiesTable');
    tableBody.innerHTML = '';
    
    PARTIES.forEach((party, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="py-4 px-6">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span class="text-white font-bold text-sm">${index + 1}</span>
                    </div>
                    <span class="font-semibold text-gray-800">${party}</span>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex justify-center">
                    <div class="relative w-32">
                        <input
                            type="number"
                            step="0.01"
                            id="party-${index}"
                            class="party-percent w-full text-center rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="0.00"
                            min="0"
                            max="100"
                        >
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span class="text-gray-500 font-medium">%</span>
                        </div>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get input values
function getPartyData() {
    const parties = [];
    PARTIES.forEach((party, index) => {
        const input = document.getElementById(`party-${index}`);
        const percent = parseFloat(input.value) || 0;
        parties.push({
            name: party,
            percent: percent,
            seats: 0
        });
    });
    return parties;
}

// Calculate D'Hondt seats
function calculateDHondt(parties) {
    const eligible = parties.filter(p => p.percent >= THRESHOLD);
    const quotients = [];
    
    // Generate all quotients
    eligible.forEach((party, partyIndex) => {
        for (let i = 1; i <= DHONDT_SEATS; i++) {
            quotients.push({
                partyIndex: parties.findIndex(p => p.name === party.name),
                value: party.percent / i
            });
        }
    });
    
    // Sort quotients in descending order
    quotients.sort((a, b) => b.value - a.value);
    
    // Take top 100 quotients
    const topQuotients = quotients.slice(0, DHONDT_SEATS);
    
    // Count seats for each party
    const seatCount = new Array(parties.length).fill(0);
    topQuotients.forEach(q => {
        seatCount[q.partyIndex]++;
    });
    
    // Assign seats
    seatCount.forEach((seats, index) => {
        if (parties[index]) {
            parties[index].seats = seats;
        }
    });
    
    return parties;
}

// Display results
function displayResults(parties) {
    const totalSeats = DHONDT_SEATS + RESERVED_SEATS;
    const partyColors = {
        'LVV': 'bg-red-50 border-red-200',
        'LDK': 'bg-blue-50 border-blue-200',
        'PDK': 'bg-green-50 border-green-200',
        'AAK': 'bg-yellow-50 border-yellow-200',
        'NISMA': 'bg-purple-50 border-purple-200',
    };
    
    // Add reserved seats
    const allParties = [...parties, {
        name: 'Tjerët (Minoritetet)',
        seats: RESERVED_SEATS
    }];
    
    const resultsHTML = `
        <div class="p-6 md:p-8">
            <!-- Results Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">
                        Rezultatet e Llogaritjes
                    </h3>
                    <p class="text-gray-600">
                        Shpërndarja e mandateve sipas sistemit D'Hondt
                    </p>
                </div>
                <div class="px-4 py-2 bg-green-50 text-green-700 rounded-full font-semibold">
                    Totali: ${totalSeats} mandate
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div class="text-gray-500 text-sm font-medium mb-2">Mandate D'Hondt</div>
                    <div class="text-3xl font-bold text-blue-600">${DHONDT_SEATS}</div>
                </div>
                <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div class="text-gray-500 text-sm font-medium mb-2">Mandate Rezervuarë</div>
                    <div class="text-3xl font-bold text-purple-600">${RESERVED_SEATS}</div>
                </div>
            </div>

            <!-- Desktop Table (hidden on mobile) -->
            <div class="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table class="w-full">
                    <thead class="bg-gradient-to-r from-blue-50 to-blue-100">
                        <tr>
                            <th class="py-4 px-6 text-left text-gray-700 font-semibold">Partia</th>
                            <th class="py-4 px-6 text-center text-gray-700 font-semibold">Përqindja</th>
                            <th class="py-4 px-6 text-center text-gray-700 font-semibold">Mandatet</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${allParties.map(p => {
                            const colorClass = partyColors[p.name] || 'bg-gray-50 border-gray-200';
                            const percent = p.percent !== undefined ? p.percent.toFixed(2) + '%' : '–';
                            const thresholdWarning = p.percent !== undefined && p.percent < THRESHOLD ? 
                                `<div class="text-xs text-red-500 font-medium mt-1">
                                    Nuk ka kaluar pragun (${THRESHOLD}%)
                                </div>` : '';
                            
                            return `
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-3">
                                            <div class="${colorClass} w-10 h-10 rounded-lg border flex items-center justify-center">
                                                <span class="font-bold text-gray-700">${p.name.substring(0, 2)}</span>
                                            </div>
                                            <div>
                                                <span class="font-semibold text-gray-800">${p.name}</span>
                                                ${thresholdWarning}
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6 text-center">
                                        <span class="font-semibold text-gray-700 text-lg">${percent}</span>
                                    </td>
                                    <td class="py-4 px-6 text-center">
                                        <div class="flex justify-center">
                                            <div class="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                                                <span class="text-white font-bold text-xl">${p.seats}</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot class="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                        <tr>
                            <td class="py-4 px-6">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center">
                                        <span class="text-white font-bold">T</span>
                                    </div>
                                    <span class="font-bold text-gray-800">TOTAL</span>
                                </div>
                            </td>
                            <td class="py-4 px-6 text-center">
                                <span class="font-bold text-gray-700">–</span>
                            </td>
                            <td class="py-4 px-6 text-center">
                                <div class="flex justify-center">
                                    <div class="w-16 h-16 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                                        <span class="text-white font-bold text-xl">${totalSeats}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Mobile Cards (shown on mobile only) - With column headers -->
            <div class="md:hidden">
                <!-- Mobile Table Headers -->
                <div class="flex items-center justify-between mb-2 px-1">
                    <div class="text-sm font-semibold text-gray-600">Partia</div>
                    <div class="text-sm font-semibold text-gray-600">Mandatet</div>
                </div>
                
                <!-- Mobile Cards List -->
                <div class="space-y-2">
                    ${allParties.map(p => {
                        const colorClass = partyColors[p.name] || 'bg-gray-50 border-gray-200';
                        const thresholdWarning = p.percent !== undefined && p.percent < THRESHOLD ? 
                            `<div class="text-xs text-red-500 font-medium mt-1">
                                Nuk ka kaluar pragun (${THRESHOLD}%)
                            </div>` : '';
                        
                        return `
                            <div class="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                <div class="flex items-center justify-between">
                                    <!-- Party Info -->
                                    <div class="flex items-center space-x-3">
                                        <div class="${colorClass} w-9 h-9 rounded-lg border flex items-center justify-center">
                                            <span class="font-bold text-gray-700 text-xs">${p.name.substring(0, 2)}</span>
                                        </div>
                                        <div>
                                            <span class="font-semibold text-gray-800 text-sm">${p.name}</span>
                                            ${thresholdWarning}
                                        </div>
                                    </div>
                                    
                                    <!-- Mandatet Badge -->
                                    <div class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center min-w-[55px]">
                                        <span class="text-white font-bold text-base">${p.seats}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    <!-- Total Card for Mobile -->
                    <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-3 shadow-sm">
                        <div class="flex items-center justify-between">
                            <!-- Party Info -->
                            <div class="flex items-center space-x-3">
                                <div class="w-9 h-9 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center">
                                    <span class="text-white font-bold text-xs">T</span>
                                </div>
                                <div>
                                    <span class="font-bold text-gray-800 text-sm">TOTAL</span>
                                </div>
                            </div>
                            
                            <!-- Mandatet Badge -->
                            <div class="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center min-w-[55px]">
                                <span class="text-white font-bold text-base">${totalSeats}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Legend -->
            <div class="mt-8 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div class="flex flex-wrap items-center gap-6 text-sm">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-gray-700 font-medium">Mandatet D'Hondt: ${DHONDT_SEATS}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span class="text-gray-700 font-medium">Mandatet Rezervuarë: ${RESERVED_SEATS}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                        <span class="text-gray-700 font-medium">Total Mandate: ${totalSeats}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = resultsHTML;
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Main calculation function
function calculateResults() {
    const parties = getPartyData();
    const partiesWithSeats = calculateDHondt(parties);
    displayResults(partiesWithSeats);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
    
    // Add event listener to calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateResults);
    
    // Add keyboard support
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateResults();
        }
    });
});