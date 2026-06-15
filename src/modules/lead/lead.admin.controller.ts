import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { Lead } from './lead.model'
import { CallLog } from '../callLog/callLog.model'
import { Parser } from 'json2csv'

// Render admin login page
const renderLoginPage = catchAsync(async (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - Insurance Receptionist</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .login-container {
                background: white;
                border-radius: 10px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                width: 400px;
                padding: 40px;
            }
            .login-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .login-header h1 {
                color: #333;
                font-size: 24px;
                margin-bottom: 10px;
            }
            .login-header p {
                color: #666;
                font-size: 14px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #333;
                font-weight: 500;
            }
            input {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                transition: border-color 0.3s;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
            }
            button {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s;
            }
            button:hover {
                transform: translateY(-2px);
            }
            .error {
                background: #fee;
                color: #c33;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
                text-align: center;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="login-header">
                <h1>Admin Login</h1>
                <p>Insurance AI Receptionist Dashboard</p>
            </div>
            <div id="errorMsg" class="error" style="display: none;"></div>
            <form id="loginForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" placeholder="admin@insurance.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                try {
                    const response = await fetch('/admin/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                        localStorage.setItem('adminToken', data.data.token);
                        window.location.href = '/admin/dashboard';
                    } else {
                        const errorDiv = document.getElementById('errorMsg');
                        errorDiv.textContent = data.message || 'Login failed';
                        errorDiv.style.display = 'block';
                        setTimeout(() => errorDiv.style.display = 'none', 3000);
                    }
                } catch (error) {
                    const errorDiv = document.getElementById('errorMsg');
                    errorDiv.textContent = 'Network error. Please try again.';
                    errorDiv.style.display = 'block';
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Handle admin login
const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body

  // Static admin credentials (you can change these)
  const ADMIN_EMAIL = 'admin@insurance.com'
  const ADMIN_PASSWORD = 'Admin@123'

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Generate simple token
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Login successful',
      data: { token, email: ADMIN_EMAIL },
    })
  } else {
    res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid credentials',
    })
  }
})

// Render admin dashboard (no auth check for the page itself)
const renderDashboard = catchAsync(async (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard - Insurance Leads</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            body {
                background: #f5f7fb;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .navbar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .navbar-brand {
                color: white !important;
                font-weight: bold;
            }
            .nav-link {
                color: white !important;
            }
            .container-fluid {
                margin-top: 20px;
            }
            .card {
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                margin-bottom: 20px;
            }
            .card-header {
                background: white;
                border-bottom: 1px solid #eee;
                padding: 20px;
                font-weight: bold;
                font-size: 18px;
            }
            .filter-section {
                background: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .btn-export {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }
            .btn-filter {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }
            .stat-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .stat-number {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
            }
            .stat-label {
                color: #666;
                font-size: 14px;
                margin-top: 10px;
            }
            .logout-btn {
                cursor: pointer;
            }
            table {
                width: 100% !important;
            }
            .badge {
                padding: 5px 10px;
                border-radius: 5px;
            }
            .badge-auto { background: #007bff; color: white; }
            .badge-home { background: #28a745; color: white; }
            .badge-commercial { background: #ffc107; color: black; }
            .badge-life { background: #dc3545; color: white; }
            .badge-health { background: #17a2b8; color: white; }
            .badge-New { background: #17a2b8; color: white; }
            .badge-Contacted { background: #ffc107; color: black; }
            .badge-Quoted { background: #fd7e14; color: white; }
            .badge-Converted { background: #28a745; color: white; }
            .badge-Lost { background: #dc3545; color: white; }
        </style>
    </head>
    <body>
        <nav class="navbar navbar-dark">
            <div class="container">
                <a class="navbar-brand" href="#">
                    <i class="fas fa-phone-alt"></i> AI Insurance Receptionist
                </a>
                <ul class="navbar-nav ml-auto flex-row">
                    <li class="nav-item me-3">
                        <span class="nav-link" id="adminEmail">Admin</span>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link logout-btn" onclick="logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </li>
                </ul>
            </div>
        </nav>

        <div class="container-fluid">
            <div class="row">
                <div class="col-md-3 mb-3">
                    <div class="stat-card">
                        <div class="stat-number" id="totalLeads">0</div>
                        <div class="stat-label">Total Leads</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stat-card">
                        <div class="stat-number" id="autoLeads">0</div>
                        <div class="stat-label">Auto Insurance</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stat-card">
                        <div class="stat-number" id="homeLeads">0</div>
                        <div class="stat-label">Home Insurance</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stat-card">
                        <div class="stat-number" id="convertedLeads">0</div>
                        <div class="stat-label">Converted</div>
                    </div>
                </div>
            </div>

            <div class="filter-section">
                <h5><i class="fas fa-filter"></i> Filter Leads</h5>
                <div class="row">
                    <div class="col-md-3">
                        <label>From Date</label>
                        <input type="date" id="fromDate" class="form-control">
                    </div>
                    <div class="col-md-3">
                        <label>To Date</label>
                        <input type="date" id="toDate" class="form-control">
                    </div>
                    <div class="col-md-3">
                        <label>Insurance Type</label>
                        <select id="insuranceType" class="form-control">
                            <option value="">All</option>
                            <option value="Auto">Auto</option>
                            <option value="Home">Home</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Life">Life</option>
                            <option value="Health">Health</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label>Lead Status</label>
                        <select id="leadStatus" class="form-control">
                            <option value="">All</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-12">
                        <button class="btn-filter" onclick="applyFilters()">
                            <i class="fas fa-search"></i> Apply Filters
                        </button>
                        <button class="btn-export ms-2" onclick="exportCSV()">
                            <i class="fas fa-download"></i> Export CSV
                        </button>
                        <button class="btn-secondary ms-2" onclick="resetFilters()">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <i class="fas fa-table"></i> Leads Management
                </div>
                <div class="card-body">
                    <table id="leadsTable" class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Insurance Type</th>
                                <th>Status</th>
                                <th>VIN</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
        <script src="https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

        <script>
            let dataTable;
            
            // Check for token on page load
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/admin/login';
            }

            function logout() {
                localStorage.removeItem('adminToken');
                Swal.fire('Logged Out', 'Session ended successfully', 'success').then(() => {
                    window.location.href = '/admin/login';
                });
            }

            async function loadStatistics() {
                try {
                    const token = localStorage.getItem('adminToken');
                    const response = await fetch('/admin/api/statistics', {
                        headers: { 'Authorization': \`Bearer \${token}\` }
                    });
                    const data = await response.json();
                    if (data.success) {
                        document.getElementById('totalLeads').textContent = data.data.total;
                        document.getElementById('autoLeads').textContent = data.data.auto;
                        document.getElementById('homeLeads').textContent = data.data.home;
                        document.getElementById('convertedLeads').textContent = data.data.converted;
                    } else if (data.message === 'Unauthorized') {
                        window.location.href = '/admin/login';
                    }
                } catch (error) {
                    console.error('Error loading statistics:', error);
                }
            }

            function loadLeadsTable() {
                const columns = [
                    { data: '_id', width: '200px' },
                    { data: 'name' },
                    { data: 'phone' },
                    { data: 'email', defaultContent: 'N/A' },
                    { 
                        data: 'insuranceType',
                        render: function(data) {
                            return \`<span class="badge badge-\${data.toLowerCase()}\">\${data}</span>\`;
                        }
                    },
                    {
                        data: 'status',
                        render: function(data) {
                            return \`<span class="badge badge-\${data}\">\${data}</span>\`;
                        }
                    },
                    {
                        data: 'vehicleDetails',
                        render: function(data) {
                            return data?.vin ? data.vin.substring(0, 10) + '...' : 'N/A';
                        }
                    },
                    {
                        data: 'createdAt',
                        render: function(data) {
                            return new Date(data).toLocaleDateString();
                        }
                    },
                    {
                        data: '_id',
                        render: function(data) {
                            return \`
                                <button class="btn btn-sm btn-info" onclick="viewLead('\${data}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            \`;
                        }
                    }
                ];

                dataTable = $('#leadsTable').DataTable({
                    processing: true,
                    serverSide: false,
                    ajax: {
                        url: '/admin/api/leads',
                        type: 'GET',
                        headers: { 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` },
                        data: function(d) {
                            return {
                                fromDate: $('#fromDate').val(),
                                toDate: $('#toDate').val(),
                                insuranceType: $('#insuranceType').val(),
                                status: $('#leadStatus').val()
                            };
                        },
                        dataSrc: function(json) {
                            if (json.success) {
                                return json.data;
                            } else if (json.message === 'Unauthorized') {
                                window.location.href = '/admin/login';
                                return [];
                            }
                            return [];
                        }
                    },
                    columns: columns,
                    order: [[7, 'desc']],
                    pageLength: 25,
                    language: {
                        search: "Search:",
                        lengthMenu: "Show _MENU_ entries per page",
                        info: "Showing _START_ to _END_ of _TOTAL_ leads"
                    }
                });
            }

            function applyFilters() {
                dataTable.ajax.reload();
                loadStatistics();
            }

            function resetFilters() {
                $('#fromDate').val('');
                $('#toDate').val('');
                $('#insuranceType').val('');
                $('#leadStatus').val('');
                applyFilters();
            }

            async function exportCSV() {
                try {
                    const token = localStorage.getItem('adminToken');
                    const params = new URLSearchParams({
                        fromDate: $('#fromDate').val(),
                        toDate: $('#toDate').val(),
                        insuranceType: $('#insuranceType').val(),
                        status: $('#leadStatus').val()
                    });
                    
                    const response = await fetch(\`/admin/api/export-csv?\${params}\`, {
                        headers: { 'Authorization': \`Bearer \${token}\` }
                    });
                    
                    if (response.status === 401) {
                        window.location.href = '/admin/login';
                        return;
                    }
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`leads_\${new Date().toISOString().split('T')[0]}.csv\`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    Swal.fire('Success', 'CSV exported successfully', 'success');
                } catch (error) {
                    Swal.fire('Error', 'Failed to export CSV', 'error');
                }
            }

            async function viewLead(id) {
                try {
                    const token = localStorage.getItem('adminToken');
                    const response = await fetch(\`/admin/api/lead/\${id}\`, {
                        headers: { 'Authorization': \`Bearer \${token}\` }
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        const lead = data.data;
                        let details = \`
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Customer Information</h6>
                                    <p><strong>Name:</strong> \${lead.name}</p>
                                    <p><strong>Phone:</strong> \${lead.phone}</p>
                                    <p><strong>Email:</strong> \${lead.email || 'N/A'}</p>
                                    <p><strong>Insurance Type:</strong> \${lead.insuranceType}</p>
                                    <p><strong>Status:</strong> \${lead.status}</p>
                                    <p><strong>Created:</strong> \${new Date(lead.createdAt).toLocaleString()}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Vehicle Details</h6>
                                    <p><strong>VIN:</strong> \${lead.vehicleDetails?.vin || 'N/A'}</p>
                                    <p><strong>Make:</strong> \${lead.vehicleDetails?.make || 'N/A'}</p>
                                    <p><strong>Model:</strong> \${lead.vehicleDetails?.model || 'N/A'}</p>
                                    <p><strong>Year:</strong> \${lead.vehicleDetails?.year || 'N/A'}</p>
                                    <p><strong>VIN Valid:</strong> \${lead.vehicleDetails?.isValidVin ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-12">
                                    <h6>Notes & Summary</h6>
                                    <p><strong>Notes:</strong> \${lead.notes || 'N/A'}</p>
                                    <p><strong>Call Summary:</strong> \${lead.callSummary || 'N/A'}</p>
                                    <p><strong>Synced to InsuredMine:</strong> \${lead.syncedToInsuredMine ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        \`;
                        
                        Swal.fire({
                            title: 'Lead Details',
                            html: details,
                            width: '800px',
                            confirmButtonText: 'Close'
                        });
                    }
                } catch (error) {
                    Swal.fire('Error', 'Failed to load lead details', 'error');
                }
            }

            $(document).ready(function() {
                loadStatistics();
                loadLeadsTable();
            });
        </script>
    </body>
    </html>
  `)
})

// API: Get leads with filters
const getLeadsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, insuranceType, status } = req.query

  const query: any = {}

  if (insuranceType) query.insuranceType = insuranceType
  if (status) query.status = status

  if (fromDate || toDate) {
    query.createdAt = {}
    if (fromDate) {
      query.createdAt.$gte = new Date(fromDate as string)
      query.createdAt.$gte.setHours(0, 0, 0, 0)
    }
    if (toDate) {
      query.createdAt.$lte = new Date(toDate as string)
      query.createdAt.$lte.setHours(23, 59, 59, 999)
    }
  }

  const leads = await Lead.find(query).sort({ createdAt: -1 })

  res.json({
    success: true,
    data: leads,
  })
})

// API: Get statistics
const getStatistics = catchAsync(async (req: Request, res: Response) => {
  const [total, auto, home, converted] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ insuranceType: 'Auto' }),
    Lead.countDocuments({ insuranceType: 'Home' }),
    Lead.countDocuments({ status: 'Converted' }),
  ])

  res.json({
    success: true,
    data: { total, auto, home, converted },
  })
})

// API: Export to CSV
const exportToCSV = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, insuranceType, status } = req.query

  const query: any = {}
  if (insuranceType) query.insuranceType = insuranceType
  if (status) query.status = status

  if (fromDate || toDate) {
    query.createdAt = {}
    if (fromDate) {
      query.createdAt.$gte = new Date(fromDate as string)
      query.createdAt.$gte.setHours(0, 0, 0, 0)
    }
    if (toDate) {
      query.createdAt.$lte = new Date(toDate as string)
      query.createdAt.$lte.setHours(23, 59, 59, 999)
    }
  }

  const leads = await Lead.find(query).sort({ createdAt: -1 })

  // Format data for CSV
  const csvData = leads.map((lead) => ({
    'Lead ID': lead._id,
    Name: lead.name,
    Phone: lead.phone,
    Email: lead.email || '',
    'Insurance Type': lead.insuranceType,
    Status: lead.status,
    VIN: lead.vehicleDetails?.vin || '',
    'Vehicle Make': lead.vehicleDetails?.make || '',
    'Vehicle Model': lead.vehicleDetails?.model || '',
    'Vehicle Year': lead.vehicleDetails?.year || '',
    'VIN Valid': lead.vehicleDetails?.isValidVin ? 'Yes' : 'No',
    'Property Address': lead.propertyDetails?.address || '',
    'Property City': lead.propertyDetails?.city || '',
    'Property State': lead.propertyDetails?.state || '',
    'Property Zip': lead.propertyDetails?.zipCode || '',
    'Business Name': lead.businessName || '',
    'Created At': new Date(lead.createdAt!).toLocaleString(),
    'Updated At': new Date(lead.updatedAt!).toLocaleString(),
    'Synced to InsuredMine': lead.syncedToInsuredMine ? 'Yes' : 'No',
    Notes: lead.notes || '',
    'Call Summary': lead.callSummary || '',
  }))

  const parser = new Parser()
  const csv = parser.parse(csvData)

  res.header('Content-Type', 'text/csv')
  res.attachment(`leads_${new Date().toISOString().split('T')[0]}.csv`)
  res.send(csv)
})

// API: Get single lead
const getLeadDetails = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const lead = await Lead.findById(id).populate('callLogId')

  if (!lead) {
     res.status(404).json({ success: false, message: 'Lead not found' })
     return
  }

  res.json({ success: true, data: lead })
})

// Admin auth middleware
const adminAuth = catchAsync(async (req: Request, res: Response, next: any): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
     res.status(401).json({ success: false, message: 'Unauthorized' })
     return
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const email = decoded.split(':')[0]

    if (email !== 'admin@insurance.com') {
       res.status(401).json({ success: false, message: 'Invalid token' })
       return
    }

    next()
  } catch (error) {
     res.status(401).json({ success: false, message: 'Invalid token' })
     return
  }
})

export const LeadAdminController = {
  renderLoginPage,
  adminLogin,
  renderDashboard,
  getLeadsForAdmin,
  getStatistics,
  exportToCSV,
  getLeadDetails,
  adminAuth,
}
