// src/admin/pages/Reports.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAdminBookingsOverTime,
  getAdminDashboardMetrics,
  getAdminRevenueOverTime,
  getAdminServiceDistribution,
  getAdminUserGrowthOverTime,
} from '../../api/reports.js';
import { getAdminEventStats } from '../../api/eventStats.js';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Reports = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [applyKey, setApplyKey] = useState(0);

  const [totals, setTotals] = useState({ users: 0, bookings: 0, revenue: 0, gallery: 0, services: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample data - in a real app, this would come from an API
  const [bookingData, setBookingData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [eventStats, setEventStats] = useState({ totalTickets: 0, totalRevenue: 0, ticketCounts: [], eventTypeCounts: [] });
  const [eventLoading, setEventLoading] = useState(false);

  const toCsvValue = (value) => {
    const str = value === undefined || value === null ? '' : String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const downloadCsv = (filename, rows) => {
    const csv = rows.map((r) => r.map(toCsvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const buildReportHtml = ({ rangeLabel, totals, bookingData, revenueData, serviceData, userData }) => {
    const safe = (v) => (v === undefined || v === null ? '' : String(v));
    const now = new Date().toLocaleString();

    const table = (title, headers, rows) => {
      const headHtml = headers.map((h) => `<th>${safe(h)}</th>`).join('');
      const rowsHtml = rows
        .map((r) => `<tr>${r.map((c) => `<td>${safe(c)}</td>`).join('')}</tr>`)
        .join('');
      return `
        <div class="section">
          <div class="h3">${safe(title)}</div>
          <table>
            <thead><tr>${headHtml}</tr></thead>
            <tbody>${rowsHtml || `<tr><td colspan="${headers.length}" class="muted">No data</td></tr>`}</tbody>
          </table>
        </div>
      `;
    };

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Admin Report</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111827; }
      .card { max-width: 980px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 14px; padding: 20px; }
      .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
      .h1 { font-size: 20px; font-weight: 700; margin: 0; }
      .h2 { font-size: 14px; font-weight: 700; margin: 0; }
      .h3 { font-size: 13px; font-weight: 700; margin: 18px 0 10px; }
      .muted { color: #6B7280; font-size: 12px; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
      .kpi { border: 1px solid #F3F4F6; border-radius: 12px; padding: 12px; }
      .kpi .label { color: #6B7280; font-size: 12px; margin-bottom: 4px; }
      .kpi .value { font-size: 16px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #F3F4F6; font-size: 12px; }
      th { color: #374151; font-weight: 700; background: #F9FAFB; }
      .divider { height: 1px; background: #E5E7EB; margin: 14px 0; }
      .btn { display: inline-block; background: #111827; color: #fff; border: 0; padding: 10px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; }
      @media print { .no-print { display: none; } body { padding: 0; } .card { border: none; } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="top">
        <div>
          <p class="h1">Admin Report</p>
          <div class="muted">Generated: ${safe(now)}</div>
          <div class="muted">Range: ${safe(rangeLabel)}</div>
        </div>
        <div class="no-print">
          <button class="btn" onclick="window.print()">Download / Print</button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid">
        <div class="kpi"><div class="label">Users</div><div class="value">${safe(Number(totals?.users || 0).toLocaleString())}</div></div>
        <div class="kpi"><div class="label">Bookings</div><div class="value">${safe(Number(totals?.bookings || 0).toLocaleString())}</div></div>
        <div class="kpi"><div class="label">Revenue</div><div class="value">${safe(formatETB(totals?.revenue || 0))}</div></div>
      </div>

      ${table('Users Over Time', ['Period', 'New Users'], (userData || []).map((r) => [r.name, r.users]))}
      ${table('Revenue Over Time', ['Period', 'Revenue', 'Transactions'], (revenueData || []).map((r) => [r.name, formatETB(r.revenue), r.transactions]))}
      ${table('Service Distribution', ['Event Type', 'Bookings', 'Revenue'], (serviceData || []).map((r) => [r.name, r.value, formatETB(r.revenue)]))}
      ${table('Bookings Over Time', ['Period', 'Bookings'], (bookingData || []).map((r) => [r.name, r.bookings]))}
    </div>
  </body>
</html>`;
    return html;
  };

  // Initialize data
  useEffect(() => {
    let active = true;

    const rangeToGroupBy = (range) => {
      switch (range) {
        case 'week':
          return 'day';
        case 'month':
          return 'day';
        case 'quarter':
          return 'week';
        case 'year':
          return 'month';
        default:
          return 'day';
      }
    };

    const formatPeriodLabel = (raw) => {
      if (!raw) return '';
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return String(raw);
      return d.toLocaleDateString();
    };

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const groupBy = rangeToGroupBy(dateRange);

        const params = {};
        if (dateRange === 'custom' && startDate && endDate) {
          params.from = startDate;
          params.to = endDate;
        }
        params.groupBy = groupBy;

        const [metrics, bookingsSeries, revenueSeries, serviceDistribution, usersSeries] = await Promise.all([
          getAdminDashboardMetrics(),
          getAdminBookingsOverTime(params),
          getAdminRevenueOverTime(params),
          getAdminServiceDistribution(),
          getAdminUserGrowthOverTime(params),
        ]);

        if (!active) return;

        setTotals(metrics?.totals || { users: 0, bookings: 0, revenue: 0, gallery: 0, services: 0 });

        setBookingData(
          Array.isArray(bookingsSeries)
            ? bookingsSeries.map((row) => ({
                name: formatPeriodLabel(row.period),
                bookings: Number(row.count || 0),
              }))
            : []
        );

        setRevenueData(
          Array.isArray(revenueSeries)
            ? revenueSeries.map((row) => ({
                name: formatPeriodLabel(row.period),
                revenue: Number(row.revenue || 0),
                transactions: Number(row.transactions || 0),
              }))
            : []
        );

        setServiceData(
          Array.isArray(serviceDistribution)
            ? serviceDistribution.map((row) => ({
                name: String(row.eventType || 'Other'),
                value: Number(row.bookings || 0),
                revenue: Number(row.revenue || 0),
              }))
            : []
        );

        setUserData(
          Array.isArray(usersSeries)
            ? usersSeries.map((row) => ({
                name: formatPeriodLabel(row.period),
                users: Number(row.count || 0),
              }))
            : []
        );
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to load reports');
        setBookingData([]);
        setRevenueData([]);
        setServiceData([]);
        setUserData([]);
        setTotals({ users: 0, bookings: 0, revenue: 0, gallery: 0, services: 0 });
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [dateRange, applyKey]);

  useEffect(() => {
    if (activeTab === 'events') {
      let active = true;
      const loadEventStats = async () => {
        setEventLoading(true);
        try {
          const data = await getAdminEventStats();
          if (!active) return;
          setEventStats(data);
        } catch (e) {
          if (!active) return;
          console.error('Failed to load event stats', e);
          setEventStats({ totalTickets: 0, totalRevenue: 0, ticketCounts: [], eventTypeCounts: [] });
        } finally {
          if (!active) return;
          setEventLoading(false);
        }
      };
      loadEventStats();
      return () => { active = false; };
    }
  }, [activeTab]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // In a real app, you would fetch data based on the selected range
  };

  const handleExport = (format) => {
    const rangeLabel =
      dateRange === 'custom' && startDate && endDate
        ? `${startDate} → ${endDate}`
        : String(dateRange || '');

    if (format === 'pdf') {
      const win = window.open('', '_blank');
      if (!win) {
        alert('Popup blocked. Please allow popups to export the PDF.');
        return;
      }
      const html = buildReportHtml({
        rangeLabel,
        totals,
        bookingData,
        revenueData,
        serviceData,
        userData,
      });
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      return;
    }

    if (format === 'excel') {
      const rows = [];
      rows.push(['Admin Report']);
      rows.push(['Generated', new Date().toLocaleString()]);
      rows.push(['Range', rangeLabel]);
      rows.push([]);
      rows.push(['Totals']);
      rows.push(['Users', totals?.users || 0]);
      rows.push(['Bookings', totals?.bookings || 0]);
      rows.push(['Revenue', totals?.revenue || 0]);
      rows.push([]);

      rows.push(['Users Over Time']);
      rows.push(['Period', 'New Users']);
      userData.forEach((r) => rows.push([r.name, r.users]));
      rows.push([]);

      rows.push(['Revenue Over Time']);
      rows.push(['Period', 'Revenue', 'Transactions']);
      revenueData.forEach((r) => rows.push([r.name, r.revenue, r.transactions]));
      rows.push([]);

      rows.push(['Service Distribution']);
      rows.push(['Event Type', 'Bookings', 'Revenue']);
      serviceData.forEach((r) => rows.push([r.name, r.value, r.revenue]));
      rows.push([]);

      rows.push(['Bookings Over Time']);
      rows.push(['Period', 'Bookings']);
      bookingData.forEach((r) => rows.push([r.name, r.bookings]));

      const filename = `admin-report-${String(dateRange || 'range')}.csv`;
      downloadCsv(filename, rows);
    }
  };

  const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#A855F7'];

  const CHART_THEME = {
    grid: 'rgba(148,163,184,0.25)',
    tick: '#94A3B8',
    users: { stroke: '#6366F1', fill: 'url(#usersGradient)' },
    bookings: { stroke: '#22C55E', fill: 'url(#bookingsGradient)' },
    revenue: { stroke: '#F97316', fill: 'url(#revenueGradient)' },
  };

  const formatETB = (value) => {
    const num = Number(value || 0);
    return `ETB ${Number.isFinite(num) ? num.toLocaleString() : '0'}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl border border-white/10 bg-white/90 dark:bg-gray-900/70 shadow-lg backdrop-blur-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm text-gray-700 dark:text-gray-200">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: entry.color }} />
                <span className="font-medium">{entry.name}:</span>{' '}
                {entry?.dataKey === 'revenue' ? formatETB(entry.value) : entry.value}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container px-6 mx-auto grid">
      {error && (
        <div className="w-full p-4 my-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-200 dark:border-red-700">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('reports')}
        </h2>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="week">{t('this_week')}</option>
            <option value="month">{t('this_month')}</option>
            <option value="quarter">{t('this_quarter')}</option>
            <option value="year">{t('this_year')}</option>
            <option value="custom">{t('custom_range')}</option>
          </select>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red"
          >
            {t('export_pdf')}
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green"
          >
            {t('export_excel')}
          </button>
        </div>
      </div>

      {/* Custom date range selector */}
      {dateRange === 'custom' && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('start_date')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('end_date')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
              />
            </div>
            <button
              onClick={() => setApplyKey((k) => k + 1)}
              className="mt-6 px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
            >
              {t('apply_filter')}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          {['overview', 'bookings', 'revenue', 'services', 'users', 'events'].map((tab) => (
            <li key={tab} className="mr-2">
              <button
                onClick={() => setActiveTab(tab)}
                className={`inline-block py-4 px-4 text-sm font-medium text-center border-b-2 rounded-t-lg ${
                  activeTab === tab
                    ? 'text-purple-600 border-purple-600 dark:text-purple-500 dark:border-purple-500'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
              >
                {t(tab)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {/* Users Over Time */}
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('users_over_time') || t('user_growth') || 'Users Over Time'}
            </h4>
            <div className="h-80">
              {userData.length === 0 && !loading ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_data') || 'No data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userData}>
                    <defs>
                      <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke={CHART_THEME.users.stroke}
                      fill={CHART_THEME.users.fill}
                      strokeWidth={2.5}
                      name={t('users') || 'Users'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('revenue_over_time')}
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_THEME.revenue.stroke}
                    fill={CHART_THEME.revenue.fill}
                    strokeWidth={2.5}
                    name={t('revenue') || 'Revenue'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('service_distribution')}
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Growth */}
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('user_growth')}
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userData}>
                  <defs>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="users" stroke={CHART_THEME.users.stroke} strokeWidth={2.5} dot={false} name={t('users') || 'Users'} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="grid gap-6 mb-8 md:grid-cols-1">
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('booking_analytics')}
            </h4>
            <div className="h-96">
              {bookingData.length === 0 && !loading ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_data') || 'No data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingData}>
                    <defs>
                      <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke={CHART_THEME.bookings.stroke}
                      fill={CHART_THEME.bookings.fill}
                      strokeWidth={2.5}
                      name={t('total_bookings') || 'Bookings'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="grid gap-6 mb-8 md:grid-cols-1">
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('revenue_analytics')}
            </h4>
            <div className="h-96">
              {revenueData.length === 0 && !loading ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_data') || 'No data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_THEME.revenue.stroke}
                      fill={CHART_THEME.revenue.fill}
                      strokeWidth={2.5}
                      name={t('revenue') || 'Revenue'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('service_distribution')}
            </h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    innerRadius={58}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('service_performance')}
            </h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" fill={CHART_THEME.users.stroke} radius={[8, 8, 0, 0]} name={t('market_share')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="grid gap-6 mb-8 md:grid-cols-1">
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('user_growth_analytics')}
            </h4>
            <div className="h-96">
              {userData.length === 0 && !loading ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_data') || 'No data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userData}>
                    <defs>
                      <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke={CHART_THEME.users.stroke}
                      fill={CHART_THEME.users.fill}
                      strokeWidth={2.5}
                      name={t('new_users') || t('users') || 'Users'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {/* Event Ticket Counts */}
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('tickets_per_event') || 'Tickets per Event'}
            </h4>
            <div className="h-96">
              {eventLoading ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('loading') || 'Loading...'}
                </div>
              ) : eventStats.ticketCounts.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_data') || 'No data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventStats.ticketCounts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <YAxis dataKey="eventTitle" type="category" width={120} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.tick, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ticketCount" fill="#10B981" name={t('tickets') || 'Tickets'} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Event Type Distribution */}
          <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
              {t('event_types') || 'Event Types'}
            </h4>
            <div className="h-96">
              {eventLoading ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('loading') || 'Loading...'}
                </div>
              ) : eventStats.eventTypeCounts.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_data') || 'No data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventStats.eventTypeCounts}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="eventCount"
                      name={t('events') || 'Events'}
                    >
                      {eventStats.eventTypeCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total_users')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {Number(totals.users || 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-green-500 bg-green-100 rounded-full dark:text-green-100 dark:bg-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total_revenue')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {formatETB(totals.revenue || 0)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total_services')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {Number(totals.services || 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-teal-500 bg-teal-100 rounded-full dark:text-teal-100 dark:bg-teal-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total_bookings')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {Number(totals.bookings || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;