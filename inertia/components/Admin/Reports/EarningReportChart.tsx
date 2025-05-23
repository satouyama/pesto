import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { monthMap } from '@/utils/date_formatter';
import { Spinner } from '@chakra-ui/react';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

export default function EarningReportChart({
  periodType,
  data,
  isLoading,
  onPeriodSelect,
}: {
  periodType: 'week' | 'month';
  data: any;
  isLoading: boolean;
  onPeriodSelect: (period: string) => void;
}) {
  const currentPeriod = new Date().toLocaleString('default', periodType === 'week' ? { weekday: 'short' } : { month: 'short' });

  const series = [
    {
      name: 'Total Earnings',
      data: data?.reports?.map((report: any) => report.totalEarnings),
    },
  ];

  // chart option
  const options: ApexOptions = {
    chart: {
      id: 'earning-report',
      fontFamily: 'Inter',
      stacked: false,
      offsetY: 0,
      toolbar: { show: false },
      events: {
        dataPointSelection: function (_event, _chartContext, config) {
          const selectedPeriod = data?.reports[config.dataPointIndex].period;
          if (selectedPeriod) {
            onPeriodSelect(selectedPeriod);
          }
        },
      },
    },

    legend: { show: false },
    dataLabels: { enabled: false },

    // axis
    xaxis: {
      categories: data?.reports.map((report: any) => {
        const pt = monthMap[report.period] ?? report.period;
        return pt.substring(0, 3);
      }),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          cssClass: 'fill-secondary-600',
        },
      },
    },

    // yaxis
    yaxis: {
      labels: {
        formatter: (value: number) => convertToCurrencyFormat(value),
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
      tickAmount: 6,
    },

    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 3,
        colors: {
          ranges: data?.reports?.map((report: any) => ({
            from: report.totalEarnings,
            to: report.totalEarnings,
            color:
              report.period?.substring(0, 3) === currentPeriod
                ? 'var(--color-green-500)'
                : 'var(--color-secondary-500)',
          })),
        },
      },
    },

    // grid
    grid: {
      borderColor: '#E2E8F0',
      padding: {
        bottom: 0,
      },
    },

    title: {
      text: `This ${periodType === 'week' ? 'Week' : 'Year'}`
    },
  };

  return (
    <div className="w-full aspect-[3/2] max-h-64">
      {isLoading ? (
        <div className="w-full flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <Chart series={series} options={options} type="bar" height={256} />
      )}
    </div>
  );
}
