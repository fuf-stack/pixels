export type OrderStatus = 'delayed' | 'delivered' | 'packing';

export interface SnackOrder {
  amount: number;
  customer: string;
  email: string;
  snack: string;
  status: OrderStatus;
}

export const statusConfig: Record<
  OrderStatus,
  { color: 'danger' | 'success' | 'warning'; label: string }
> = {
  delayed: { color: 'danger', label: 'Delayed' },
  delivered: { color: 'success', label: 'Delivered' },
  packing: { color: 'warning', label: 'Packing' },
};

export const defaultOrders: SnackOrder[] = [
  {
    amount: 31.6,
    customer: 'Klara Müller',
    email: 'klara@berlin-bites.de',
    snack: 'Currywurst fries',
    status: 'delivered',
  },
  {
    amount: 24.2,
    customer: 'Jules Dubois',
    email: 'jules@paris-pastry.fr',
    snack: 'Mini croissants',
    status: 'delivered',
  },
  {
    amount: 18.9,
    customer: 'Marta Silva',
    email: 'marta@lisbon-lunch.pt',
    snack: 'Pastéis de nata',
    status: 'packing',
  },
];

export const playgroundOrders: SnackOrder[] = [
  ...defaultOrders,
  {
    amount: 27.5,
    customer: 'Noah van Dijk',
    email: 'noah@amsterdam-bakery.nl',
    snack: 'Stroopwafels',
    status: 'delivered',
  },
  {
    amount: 34.1,
    customer: 'Sofia Rossi',
    email: 'sofia@roma-snacks.it',
    snack: 'Aperitivo crisps',
    status: 'packing',
  },
  {
    amount: 42.8,
    customer: 'Elsa Lindström',
    email: 'elsa@stockholm-fika.se',
    snack: 'Cinnamon buns',
    status: 'delayed',
  },
  {
    amount: 29.3,
    customer: 'Theo Novak',
    email: 'theo@prague-pantry.cz',
    snack: 'Kolache box',
    status: 'delivered',
  },
];

export const filterOrders: SnackOrder[] = [
  {
    amount: 19.4,
    customer: 'Lena Weber',
    email: 'lena@vienna-waffles.at',
    snack: 'Apricot waffles',
    status: 'delivered',
  },
  {
    amount: 22.7,
    customer: 'Marc Lefèvre',
    email: 'marc@lyon-lunch.fr',
    snack: 'Cheese tartlets',
    status: 'packing',
  },
  {
    amount: 16.2,
    customer: 'Ines Costa',
    email: 'ines@porto-pantry.pt',
    snack: 'Custard tarts',
    status: 'delayed',
  },
  {
    amount: 28.9,
    customer: 'Greta Fischer',
    email: 'greta@hamburg-harbor.de',
    snack: 'Harbor pretzels',
    status: 'delivered',
  },
];

export const compactOrders: SnackOrder[] = [
  {
    amount: 13.5,
    customer: 'Anna Kowalski',
    email: 'anna@warsaw-wafers.pl',
    snack: 'Chocolate wafers',
    status: 'delivered',
  },
  {
    amount: 17.8,
    customer: 'Milo Jensen',
    email: 'milo@copenhagen-cakes.dk',
    snack: 'Cardamom buns',
    status: 'packing',
  },
];

export const styledOrders: SnackOrder[] = [
  {
    amount: 33.4,
    customer: 'Nora Schmidt',
    email: 'nora@munich-market.de',
    snack: 'Pretzel basket',
    status: 'delivered',
  },
  {
    amount: 21.9,
    customer: 'Hugo Martin',
    email: 'hugo@nice-nibbles.fr',
    snack: 'Lavender biscuits',
    status: 'packing',
  },
  {
    amount: 38.6,
    customer: 'Chiara Bianchi',
    email: 'chiara@venice-vendor.it',
    snack: 'Pistachio biscotti',
    status: 'delayed',
  },
];

export const iconOrders: SnackOrder[] = [
  {
    amount: 26.5,
    customer: 'Freya Hansen',
    email: 'freya@oslo-oven.no',
    snack: 'Cloudberry buns',
    status: 'packing',
  },
  {
    amount: 30.2,
    customer: 'Pablo García',
    email: 'pablo@madrid-merienda.es',
    snack: 'Churro kit',
    status: 'delivered',
  },
  {
    amount: 14.7,
    customer: 'Eva Horváth',
    email: 'eva@budapest-bites.hu',
    snack: 'Mini chimney cakes',
    status: 'delayed',
  },
];
