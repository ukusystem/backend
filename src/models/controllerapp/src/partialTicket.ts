export class PartialTicket {
  readonly startTime;
  readonly endTime;
  readonly ticketID;
  readonly companyID;

  constructor(id: number, company: number, start: number, end: number) {
    this.startTime = start;
    this.endTime = end;
    this.ticketID = id;
    this.companyID = company;
  }

  getBody(): string[] {
    return [this.ticketID.toString(), this.companyID.toString(), this.startTime.toString(), this.endTime.toString()];
  }
}
