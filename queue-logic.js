(function (root) {
  'use strict';

  const FEMALE_SURCHARGE = 30;

  function calculateTotal(basePrice, customerType) {
    const price = Number(basePrice);
    if (!Number.isFinite(price) || price < 0) return 0;
    return price + (customerType === 'female' ? FEMALE_SURCHARGE : 0);
  }

  function buildPricePresentation(basePrice, customerType) {
    return {
      total: calculateTotal(basePrice, customerType),
      customerLabel: customerType === 'female' ? '女士服務' : '男士服務',
    };
  }

  function presentService(service, customerType) {
    const content = customerType === 'female' ? service.female : service.male;
    return {
      name: content.name,
      description: content.description,
      duration: service.duration,
      basePrice: service.basePrice,
    };
  }

  function getQueueCopy() {
    return {
      status: '輪候取票',
      hero: '立即攞輪候飛',
      confirmation: '確認輪候飛',
      ticket: '我的輪候飛',
      entryHelp: '可用手機遙距取票，亦可在店內自助機取票。',
    };
  }

  function getPaymentMethods(channel) {
    if (channel === 'kiosk') {
      return [{ id: 'octopus', label: '八達通', brand: 'octopus' }];
    }
    return [
      {
        id: 'stripe',
        label: 'Apple Pay（經 Stripe）',
        brand: 'applepay',
      },
    ];
  }

  function paymentMethodForChannel(channel) {
    return channel === 'kiosk' ? '八達通' : 'Apple Pay（經 Stripe）';
  }

  function canIssueTicket(channel, paymentStatus) {
    return (
      (channel === 'kiosk' && paymentStatus === 'octopus-test-approved') ||
      (channel === 'online' && paymentStatus === 'stripe-test-success')
    );
  }

  function stripePaymentKey(serviceIndex, customerType) {
    const type = customerType === 'female' ? 'female' : 'male';
    const index = Math.max(0, Math.min(2, Math.floor(Number(serviceIndex) || 0)));
    return `${type}-${index}`;
  }

  function formatTicketNo(sequence) {
    const safeSequence = Math.max(0, Math.floor(Number(sequence) || 0));
    return `L${String(safeSequence).padStart(3, '0')}`;
  }

  function createTicket({ sequence, ahead, method, service, customerType, time }) {
    const type = customerType === 'female' ? 'female' : 'male';
    const basePrice = Number(service.basePrice);
    return {
      version: 2,
      no: formatTicketNo(sequence),
      sequence: Number(sequence),
      ahead: Math.max(0, Number(ahead) || 0),
      method,
      serviceName: service.name,
      customerType: type,
      duration: Number(service.duration),
      basePrice,
      surcharge: type === 'female' ? FEMALE_SURCHARGE : 0,
      total: calculateTotal(basePrice, type),
      time,
    };
  }

  function normalizeStoredTicket(ticket) {
    if (!ticket || ticket.version !== 2) return null;
    if (!/^L\d{3,}$/.test(ticket.no) || !Number.isFinite(ticket.ahead) || ticket.ahead < 0) return null;
    if (!ticket.method || !ticket.serviceName || !['male', 'female'].includes(ticket.customerType)) return null;
    if (!Number.isFinite(ticket.total) || ticket.total < 0 || !ticket.time) return null;
    return ticket;
  }

  function upcomingTickets(currentSequence, amount) {
    const start = Math.max(0, Math.floor(Number(currentSequence) || 0));
    const count = Math.max(0, Math.floor(Number(amount) || 0));
    return Array.from({ length: count }, (_, index) => formatTicketNo(start + index + 1));
  }

  root.QueueLogic = { FEMALE_SURCHARGE, calculateTotal, buildPricePresentation, presentService, getQueueCopy, getPaymentMethods, paymentMethodForChannel, canIssueTicket, stripePaymentKey, createTicket, normalizeStoredTicket, upcomingTickets };
})(typeof window !== 'undefined' ? window : globalThis);
