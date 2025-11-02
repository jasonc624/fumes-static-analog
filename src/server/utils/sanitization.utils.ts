export function sanitizeVehicle(vehicle: any) {
  delete vehicle?.maintenance;
  delete vehicle?.creator;
  delete vehicle?.expenseGroupId;
  delete vehicle?.location;
  delete vehicle?.fleetRef;
  return vehicle;
}
export function sanitizeFleet(fleet: any) {
  delete fleet.charges_enabled;
  delete fleet.payouts_enabled;
  delete fleet.roles;
  delete fleet.settings;
  delete fleet.topics;
  delete fleet.connectedStripeAccountId;
  delete fleet.integrations;
  delete fleet.lasal;
  return fleet;
}
