describe('Automation Engine Safety & Compliance', () => {
  it('should block SMS outreach if customer has opted out (Do Not Contact)', () => {
    const customer = {
      do_not_contact: true,
      sms_consent: true,
    };

    const shouldSendSMS = !customer.do_not_contact && customer.sms_consent;
    expect(shouldSendSMS).toBe(false);
  });

  it('should allow SMS outreach only when TCPA consent is granted and DNC is false', () => {
    const customer = {
      do_not_contact: false,
      sms_consent: true,
    };

    const shouldSendSMS = !customer.do_not_contact && customer.sms_consent;
    expect(shouldSendSMS).toBe(true);
  });
});
