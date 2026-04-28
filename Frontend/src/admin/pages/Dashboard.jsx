import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAdminBookingsOverTime,
  getAdminDashboardMetrics,
  getAdminRevenueOverTime,
  getAdminServiceDistribution,
  getAdminUserGrowthOverTime,
} from '../../api/reports.js';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalGallery: 0
  });

  const [quickStats, setQuickStats] = useState({
    activeUsers: 0,
    pendingBookings: 0,
  });

  // Chart data
  const [bookingData, setBookingData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Recent activities
  const [recentActivities, setRecentActivities] = useState([]);

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

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const groupBy = rangeToGroupBy(timeRange);

        const [metrics, bookingsSeries, revenueSeries, serviceDistribution, userGrowthSeries] = await Promise.all([
          getAdminDashboardMetrics(),
          getAdminBookingsOverTime({ groupBy }),
          getAdminRevenueOverTime({ groupBy }),
          getAdminServiceDistribution(),
          getAdminUserGrowthOverTime({ groupBy }),
        ]);

        if (!active) return;

        const totals = metrics?.totals || {};
        setStats({
          totalUsers: totals.users || 0,
          totalBookings: totals.bookings || 0,
          totalRevenue: totals.revenue || 0,
          totalGallery: totals.gallery || 0,
        });
        setQuickStats({
          activeUsers: totals.activeUsers || 0,
          pendingBookings: totals.pendingBookings || 0,
        });

        setRecentActivities(Array.isArray(metrics?.recentActivity) ? metrics.recentActivity : []);

        setBookingData(
          Array.isArray(bookingsSeries)
            ? bookingsSeries.map((row) => ({
                name: String(row.period ?? ''),
                bookings: Number(row.count || 0),
              }))
            : []
        );

        setRevenueData(
          Array.isArray(revenueSeries)
            ? revenueSeries.map((row) => ({
                name: String(row.period ?? ''),
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
              }))
            : []
        );

        setUserGrowthData(
          Array.isArray(userGrowthSeries)
            ? userGrowthSeries.map((row) => ({
                name: String(row.period ?? ''),
                users: Number(row.count || 0),
              }))
            : []
        );

        setTrafficData([]);
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to load dashboard data');
        setBookingData([]);
        setRevenueData([]);
        setServiceData([]);
        setUserGrowthData([]);
        setTrafficData([]);
        setRecentActivities([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatETB = (value) => {
    const num = Number(value || 0);
    return `ETB ${Number.isFinite(num) ? num.toLocaleString() : '0'}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white border border-gray-200 rounded shadow-md dark:bg-gray-800 dark:border-gray-700">
          <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry?.dataKey === 'revenue' ? formatETB(entry.value) : entry.value}
            </p>
          ))}
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
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('dashboard')}
        </h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
        >
          <option value="week">{t('this_week')}</option>
          <option value="month">{t('this_month')}</option>
          <option value="quarter">{t('this_quarter')}</option>
          <option value="year">{t('this_year')}</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total_users')}
            </p>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              {stats.totalUsers.toLocaleString()}
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
              {t('total_bookings')}
            </p>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              {stats.totalBookings.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-purple-500 bg-purple-100 rounded-full dark:text-purple-100 dark:bg-purple-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total_revenue')}
            </p>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              {formatETB(stats.totalRevenue)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-teal-500 bg-teal-100 rounded-full dark:text-teal-100 dark:bg-teal-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm8 0v4a1 1 0 001 1h4" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('gallery') || 'Gallery Photos'}
            </p>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              {stats.totalGallery.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Bookings Chart */}
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
            {t('bookings_over_time')}
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData}>
                <defs>
                  <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="pink" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="gray" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="bookings" fill="url(#bookingsGradient)" name={t('total_bookings')} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                    <stop offset="0%" stopColor="blue" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="orange" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => formatETB(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="url(#revenueGradient)" strokeWidth={2} name={t('revenue')} />
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
                  fill="#8884d8"
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
            {t('User Growth Over Time') || 'User Growth Over Time'}
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="users" stroke="#F59E0B" fill="url(#userGrowthGradient)" strokeWidth={2} name={t('new_users') || 'New Users'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
            {t('recent_activity')}
          </h4>
          {loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</p>
          ) : recentActivities.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('no_data') || 'No data'}</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((booking) => (
                <div key={booking.id} className="flex items-start">
                  <div className="flex-shrink-0 rounded-full p-3 text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                    <span className="text-lg">📅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('booking') || 'Booking'} #{booking.id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking?.user ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
            {t('quick_stats')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('active_users')}
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {quickStats.activeUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('pending_bookings')}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                {quickStats.pendingBookings.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('avg_booking_value')}
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                {stats.totalBookings ? formatETB(Math.round((stats.totalRevenue || 0) / stats.totalBookings)) : formatETB(0)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                {t('customer_satisfaction')}
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                --
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;