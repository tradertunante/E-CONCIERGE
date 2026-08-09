// Datos ficticios para la demo. Nombres de restaurantes inspirados en lugares
// reales de Los Cabos; descripciones, precios, horarios y disponibilidad son
// inventados únicamente para esta presentación. Fotografías de Unsplash como
// placeholders visuales (no corresponden necesariamente al lugar real).

export const CATEGORIES = [
  { id: "restaurantes", label: "Restaurantes", icon: "utensils" },
  { id: "actividades", label: "Actividades", icon: "compass" },
  { id: "barcos", label: "Barcos", icon: "anchor" },
  { id: "transporte", label: "Transporte", icon: "car" },
];

const gradients = [
  "from-ocean-600 to-ocean-400",
  "from-sand-500 to-gold-400",
  "from-ocean-700 to-ocean-400",
  "from-sand-600 to-sand-300",
  "from-ocean-500 to-gold-400",
  "from-sand-400 to-ocean-300",
];

function grad(i) {
  return gradients[i % gradients.length];
}

function img(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
}

export const DEPOSIT_NOTE =
  "Este monto confirma tu reservación y se abona como crédito en tu cuenta de consumo la noche de la cena. El resto de tu consumo se paga directamente en el restaurante.";

export const RESTAURANTS = [
  {
    id: "r1",
    category: "restaurantes",
    name: "ACRE",
    location: "San José del Cabo",
    tagline: "Farm-to-table entre jardines",
    description:
      "Restaurante entre jardines tropicales con cócteles de autor y cocina sostenible, ingredientes de la huerta propia.",
    longDescription:
      "ACRE combina arquitectura orgánica y jardines exuberantes para crear una de las experiencias gastronómicas más fotografiadas de San José del Cabo. El menú de temporada prioriza ingredientes locales y de la huerta del restaurante, con maridajes de cócteles de autor. Ideal para una cena romántica o una velada especial en grupo.",
    price: 800,
    priceUnit: "persona",
    isDeposit: true,
    duration: "2 hrs",
    times: ["13:00", "15:00", "19:00", "21:00"],
    recommended: true,
    gradient: grad(0),
    image: img("1514933651103-005eec06c04b"),
  },
  {
    id: "r2",
    category: "restaurantes",
    name: "El Farallón",
    location: "Waldorf Astoria Los Cabos Pedregal",
    tagline: "Mariscos sobre el acantilado",
    description:
      "Mariscos servidos en terrazas talladas en el acantilado, frente al mar, con la puesta de sol como telón de fondo.",
    longDescription:
      "Tallado literalmente en la roca del Pacífico, El Farallón ofrece terrazas escalonadas frente al mar donde el menú de mariscos cambia con base en la pesca del día. La experiencia está pensada para ocasiones especiales: aniversarios, propuestas y cenas de celebración.",
    price: 1200,
    priceUnit: "persona",
    isDeposit: true,
    duration: "2.5 hrs",
    times: ["18:00", "19:30", "21:00"],
    recommended: true,
    gradient: grad(1),
    image: img("1476224203421-9ac39bcb3327"),
  },
  {
    id: "r3",
    category: "restaurantes",
    name: "Nobu Los Cabos",
    location: "Frente al Pacífico",
    tagline: "Fusión japonesa-peruana",
    description:
      "La icónica fusión japonesa-peruana de Nobu, frente al Pacífico, con su carta de sushi y platos de autor.",
    longDescription:
      "La propuesta insignia de Nobu llega a Los Cabos con vistas directas al Pacífico. Clásicos como el black cod miso conviven con creaciones exclusivas de la casa, en un ambiente elegante pero relajado, perfecto para grupos y cenas de negocios.",
    price: 1000,
    priceUnit: "persona",
    isDeposit: true,
    duration: "2 hrs",
    times: ["13:30", "17:00", "19:00", "20:30"],
    recommended: false,
    gradient: grad(2),
    image: img("1499028344343-cd173ffc68a9"),
  },
  {
    id: "r4",
    category: "restaurantes",
    name: "Sunset Monalisa",
    location: "Corredor Turístico",
    tagline: "La mejor vista de atardecer",
    description:
      "Cocina mediterránea con toques mexicanos y la que muchos consideran la mejor vista de atardecer de la zona.",
    longDescription:
      "Sobre un acantilado con vista panorámica al Arco de Cabo San Lucas, Sunset Monalisa combina cocina mediterránea con acentos mexicanos. El momento del atardecer, acompañado de música en vivo, es el punto culminante de la experiencia.",
    price: 900,
    priceUnit: "persona",
    isDeposit: true,
    duration: "2 hrs",
    times: ["17:30", "19:00", "20:30"],
    recommended: true,
    gradient: grad(3),
    image: img("1424847651672-bf20a4b0982b"),
  },
  {
    id: "r5",
    category: "restaurantes",
    name: "Manta",
    location: "The Cape Hotel",
    tagline: "Mexicana contemporánea",
    description:
      "Cocina mexicana contemporánea con influencias japonesas y peruanas, en un espacio de diseño frente al mar.",
    longDescription:
      "Con dirección del chef Enrique Olvera, Manta propone una cocina mexicana contemporánea con guiños asiáticos, servida en un espacio de diseño minimalista dentro de The Cape Hotel, con vista al icónico Arco.",
    price: 1000,
    priceUnit: "persona",
    isDeposit: true,
    duration: "2 hrs",
    times: ["13:00", "18:00", "19:30", "21:00"],
    recommended: false,
    gradient: grad(4),
    image: img("1540189549336-e6e99c3679fe"),
  },
  {
    id: "r6",
    category: "restaurantes",
    name: "Cocina de Autor",
    location: "Corredor Turístico",
    tagline: "Alta cocina de raíces mexicanas",
    description:
      "Alta cocina de raíces mexicanas con técnica de vanguardia, en un menú de degustación de varios tiempos.",
    longDescription:
      "Un recorrido de varios tiempos por los sabores tradicionales de México reinterpretados con técnica contemporánea. Menú de degustación con opción de maridaje, pensado para comensales que buscan una experiencia gastronómica memorable.",
    price: 1500,
    priceUnit: "persona",
    isDeposit: true,
    duration: "3 hrs",
    times: ["19:00", "20:00"],
    recommended: false,
    gradient: grad(5),
    image: img("1550966871-3ed3cdb5ed0c"),
  },
  {
    id: "r7",
    category: "restaurantes",
    name: "Flora's Field Kitchen",
    location: "Flora Farms, San José del Cabo",
    tagline: "De la granja a la mesa",
    description:
      "Cocina de rancho a mesa dentro de una granja orgánica en la sierra, con vegetales y hierbas recién cortados.",
    longDescription:
      "Ubicado dentro de Flora Farms, este restaurante al aire libre sirve platos preparados con vegetales, hierbas y huevos de la propia granja orgánica. Ambiente rústico-elegante rodeado de sembradíos, ideal para un almuerzo relajado.",
    price: 700,
    priceUnit: "persona",
    isDeposit: true,
    duration: "1.5 hrs",
    times: ["12:00", "13:30", "15:00"],
    recommended: false,
    gradient: grad(0),
    image: img("1552566626-52f8b828add9"),
  },
  {
    id: "r8",
    category: "restaurantes",
    name: "Cocina del Mar",
    location: "Esperanza Auberge Resorts",
    tagline: "Cocina costera de Baja",
    description:
      "Cocina costera de Baja California sobre acantilados, con horno de leña a la vista y productos del mar locales.",
    longDescription:
      "Instalado sobre los acantilados de Esperanza, Cocina del Mar celebra los sabores costeros de Baja California con un horno de leña como protagonista. Terrazas escalonadas frente al mar, ideales para una cena al atardecer.",
    price: 1100,
    priceUnit: "persona",
    isDeposit: true,
    duration: "2 hrs",
    times: ["18:30", "20:00"],
    recommended: false,
    gradient: grad(1),
    image: img("1559339352-11d035aa65de"),
  },
  {
    id: "r9",
    category: "restaurantes",
    name: "SEARED by One&Only",
    location: "One&Only Palmilla",
    tagline: "Steakhouse de autor",
    description:
      "Steakhouse de autor con mariscos del Pacífico, cortes premium y una extensa carta de vinos.",
    longDescription:
      "SEARED reinterpreta el concepto de steakhouse con cortes premium y mariscos frescos del Pacífico, dentro del icónico One&Only Palmilla. Carta de vinos curada y servicio de alto nivel para una cena de celebración.",
    price: 1200,
    priceUnit: "persona",
    isDeposit: true,
    duration: "2 hrs",
    times: ["18:00", "19:30", "21:00"],
    recommended: false,
    gradient: grad(2),
    image: img("1551218808-94e220e084d2"),
  },
  {
    id: "r10",
    category: "restaurantes",
    name: "Suviche",
    location: "One&Only Palmilla",
    tagline: "Sushi, ceviche y sake bar",
    description:
      "Sushi, ceviche y sake bar en un solo lugar, con fusión japonesa-mexicana frente al mar.",
    longDescription:
      "Un concepto informal-elegante dentro de One&Only Palmilla que combina sushi, ceviches y una selecta carta de sake, con toques mexicanos en cada plato. Perfecto para compartir en grupo antes o después del atardecer.",
    price: 800,
    priceUnit: "persona",
    isDeposit: true,
    duration: "1.5 hrs",
    times: ["13:00", "17:00", "19:00"],
    recommended: false,
    gradient: grad(3),
    image: img("1544025162-d76694265947"),
  },
];

export const ACTIVITIES = [
  {
    id: "a1",
    category: "actividades",
    name: "UTV por el desierto",
    location: "Desierto de Baja",
    tagline: "Dunas y arroyos en vehículo todo terreno",
    description:
      "Recorrido guiado en vehículo todo terreno por dunas y arroyos de Baja, con guía experto y equipo de seguridad.",
    longDescription:
      "Una aventura guiada a bordo de un UTV por los paisajes desérticos de Baja California Sur, cruzando dunas, arroyos secos y senderos rocosos. Incluye equipo de seguridad, guía bilingüe y parada fotográfica en un mirador panorámico.",
    price: 1400,
    priceUnit: "persona",
    duration: "2.5 hrs",
    times: ["08:00", "11:00", "15:00"],
    recommended: false,
    gradient: grad(4),
    image: img("1533587851505-d119e13fa0d7"),
  },
  {
    id: "a2",
    category: "actividades",
    name: "Paseo en camello por la playa",
    location: "Costa del Pacífico",
    tagline: "Cabalgata al atardecer",
    description:
      "Cabalgata en camellos dromedarios por la costa al atardecer, una experiencia única entre desierto y mar.",
    longDescription:
      "Un recorrido pausado en camellos dromedarios a lo largo de la costa, con el desierto de un lado y el Pacífico del otro. La salida de la tarde coincide con la mejor luz para fotografías, e incluye una breve introducción a estos animales.",
    price: 900,
    priceUnit: "persona",
    duration: "1.5 hrs",
    times: ["16:00", "17:30"],
    recommended: false,
    gradient: grad(5),
    image: img("1509316785289-025f5b846b35"),
  },
  {
    id: "a3",
    category: "actividades",
    name: "Circuito de tirolesas",
    location: "Corredor Turístico",
    tagline: "7 líneas sobre cañones",
    description:
      "7 líneas de tirolesa y puentes colgantes sobre los cañones del Corredor Turístico, con vistas al mar de Cortés.",
    longDescription:
      "Un circuito de siete tirolesas y puentes colgantes que cruza los cañones del Corredor Turístico, con tramos que ofrecen vistas al mar de Cortés y a la sierra. Incluye equipo certificado y guías capacitados en cada estación.",
    price: 1600,
    priceUnit: "persona",
    duration: "3 hrs",
    times: ["09:00", "12:00"],
    recommended: true,
    gradient: grad(0),
    image: img("1502680390469-be75c86b636f"),
  },
  {
    id: "a4",
    category: "actividades",
    name: "Motos acuáticas",
    location: "Bahía de Cabo San Lucas",
    tagline: "Recorrido costero con instructor",
    description:
      "Recorrido en moto acuática por la costa con instructor, ideal para principiantes y expertos.",
    longDescription:
      "Salida guiada en moto acuática a lo largo de la bahía, con paradas cerca de formaciones rocosas y zonas de buena visibilidad. Instrucción básica incluida para quienes suben por primera vez.",
    price: 1100,
    priceUnit: "persona",
    duration: "1 hr",
    times: ["09:00", "11:00", "13:00", "16:00"],
    recommended: false,
    gradient: grad(1),
    image: img("1521731978332-9e9e714bdd20"),
  },
  {
    id: "a5",
    category: "actividades",
    name: "ATV por el cañón",
    location: "Sierra de la Laguna",
    tagline: "Cuatrimotos por senderos rocosos",
    description:
      "Aventura en cuatrimoto por senderos rocosos y arroyos secos, con paisajes de la Sierra de la Laguna.",
    longDescription:
      "Recorrido individual en cuatrimoto por los senderos rocosos que bordean la Sierra de la Laguna, cruzando arroyos secos y vegetación de desierto. Apto para principiantes con instrucción previa incluida.",
    price: 1300,
    priceUnit: "persona",
    duration: "2 hrs",
    times: ["08:30", "11:30", "14:30"],
    recommended: false,
    gradient: grad(2),
    image: img("1530103862676-de8c9debad1d"),
  },
  {
    id: "a6",
    category: "actividades",
    name: "Rappel en pared de roca",
    location: "Cañón El Salto",
    tagline: "Descenso guiado en volcánico",
    description:
      "Descenso guiado por formaciones volcánicas, con instructores certificados y equipo completo incluido.",
    longDescription:
      "Una experiencia de rappel guiado sobre formaciones de roca volcánica, con múltiples descensos de dificultad creciente. Equipo certificado e instructores especializados garantizan una introducción segura a la disciplina.",
    price: 1200,
    priceUnit: "persona",
    duration: "2 hrs",
    times: ["08:00", "10:30"],
    recommended: false,
    gradient: grad(3),
    image: img("1522163182402-834f871fd851"),
  },
  {
    id: "a7",
    category: "actividades",
    name: "Snorkel en El Arco",
    location: "El Arco, Cabo San Lucas",
    tagline: "Aguas cristalinas junto al icónico Arco",
    description:
      "Salida guiada en panga con snorkel en las aguas del icónico Arco de Cabo San Lucas y Playa del Amor.",
    longDescription:
      "Salida en panga hacia el famoso Arco de Cabo San Lucas, con paradas para snorkel en las aguas transparentes que rodean Playa del Amor y Playa del Divorcio. Equipo de snorkel incluido y guía marino.",
    price: 1000,
    priceUnit: "persona",
    duration: "3 hrs",
    times: ["08:00", "11:00", "14:00"],
    recommended: true,
    gradient: grad(4),
    image: img("1544551763-46a013bb70d5"),
  },
];

export const BOATS = [
  {
    id: "b1",
    category: "barcos",
    name: "Yate de pesca deportiva — medio día",
    location: "Marina Cabo San Lucas",
    tagline: "Marlín, dorado y atún",
    description:
      "Salida en busca de marlín, dorado y atún, con capitán y tripulación incluidos. Ideal para grupos de hasta 6.",
    longDescription:
      "Yate equipado para pesca deportiva con capitán y tripulación experimentada, rumbo a las zonas donde suelen encontrarse marlín, dorado y atún según temporada. Incluye equipo de pesca, carnada y hielo a bordo.",
    price: 18000,
    priceUnit: "embarcación",
    capacity: "hasta 6 personas",
    duration: "5 hrs",
    times: ["06:30", "07:00"],
    recommended: false,
    gradient: grad(5),
    image: img("1567899378494-47b22a2ae96a"),
  },
  {
    id: "b2",
    category: "barcos",
    name: "Yate de pesca deportiva — día completo",
    location: "Marina Cabo San Lucas",
    tagline: "Más tiempo en aguas profundas",
    description:
      "La misma experiencia de pesca deportiva con más tiempo en zonas de pesca profunda, ideal para grupos exigentes.",
    longDescription:
      "Jornada completa de pesca deportiva con acceso a zonas de aguas más profundas, aumentando las probabilidades de una buena captura. Incluye capitán, tripulación, equipo y almuerzo ligero a bordo.",
    price: 28000,
    priceUnit: "embarcación",
    capacity: "hasta 6 personas",
    duration: "8 hrs",
    times: ["06:00"],
    recommended: false,
    gradient: grad(0),
    image: img("1512100356356-de1b84283e18"),
  },
  {
    id: "b3",
    category: "barcos",
    name: "Panga de pesca íntima",
    location: "Marina Cabo San Lucas",
    tagline: "Opción económica para 2-3 personas",
    description:
      "Opción más económica para 2-3 personas, pesca costera cerca de la bahía.",
    longDescription:
      "Una alternativa más accesible para grupos pequeños que buscan pescar cerca de la costa, sin sacrificar la experiencia de salir al mar con un capitán local.",
    price: 6500,
    priceUnit: "embarcación",
    capacity: "hasta 3 personas",
    duration: "4 hrs",
    times: ["07:00", "08:00"],
    recommended: false,
    gradient: grad(1),
    image: img("1544967082-d9d25d867d66"),
  },
  {
    id: "b4",
    category: "barcos",
    name: "Catamarán al atardecer",
    location: "Bahía de Cabo San Lucas",
    tagline: "Bebidas y música frente al Arco",
    description:
      "Paseo recreativo con bebidas y música viendo el atardecer sobre el Arco de Cabo San Lucas.",
    longDescription:
      "Navegación relajada a bordo de un catamarán rumbo al Arco, con barra libre de bebidas y música en vivo mientras el sol se oculta en el Pacífico. Una de las experiencias más solicitadas por parejas y grupos.",
    price: 1300,
    priceUnit: "persona",
    duration: "2 hrs",
    times: ["17:00"],
    recommended: true,
    gradient: grad(2),
    image: img("1500375592092-40eb2168fd21"),
  },
  {
    id: "b5",
    category: "barcos",
    name: "Avistamiento de ballenas",
    location: "Bahía de Cabo San Lucas",
    tagline: "Temporada dic–abr",
    description:
      "Tour guiado de observación de ballenas grises y jorobadas, con guía naturalista a bordo.",
    longDescription:
      "Durante la temporada de migración, este tour guiado navega hacia las zonas donde suelen avistarse ballenas grises y jorobadas, acompañado de un guía naturalista que explica su comportamiento y ruta migratoria.",
    price: 1400,
    priceUnit: "persona",
    duration: "2.5 hrs",
    times: ["08:00", "11:00"],
    recommended: false,
    gradient: grad(3),
    image: img("1568430462989-44163eb1752f"),
  },
  {
    id: "b6",
    category: "barcos",
    name: "Yate privado — playa y snorkel",
    location: "Marina Cabo San Lucas",
    tagline: "Renta privada con paradas vírgenes",
    description:
      "Renta privada con paradas en playas vírgenes, ideal para grupos y celebraciones.",
    longDescription:
      "Un yate completo a disposición del grupo por el día, con paradas en playas de acceso exclusivo por mar y zonas de snorkel poco concurridas. Incluye tripulación y equipo de snorkel.",
    price: 32000,
    priceUnit: "embarcación",
    capacity: "hasta 10 personas",
    duration: "6 hrs",
    times: ["09:00"],
    recommended: true,
    gradient: grad(4),
    image: img("1520333789090-1afc82db536a"),
  },
];

export const TRANSPORT = [
  {
    id: "t1",
    category: "transporte",
    name: "Traslado privado aeropuerto → hotel",
    location: "Aeropuerto Internacional de Los Cabos",
    tagline: "Conductor bilingüe, monitoreo de vuelo",
    description:
      "Vehículo privado con conductor bilingüe y monitoreo de vuelo para llegadas sin contratiempos.",
    longDescription:
      "Servicio de traslado privado desde el aeropuerto hasta el hotel, con monitoreo del vuelo para ajustar el horario de recogida en caso de retrasos. Conductor bilingüe y vehículo con aire acondicionado.",
    price: 1200,
    priceUnit: "trayecto",
    capacity: "hasta 4 personas",
    duration: "45 min aprox.",
    times: ["Según horario de vuelo"],
    recommended: false,
    gradient: grad(5),
    image: img("1503376780353-7e6692767b70"),
  },
  {
    id: "t2",
    category: "transporte",
    name: "Traslado privado hotel → aeropuerto",
    location: "Corredor Turístico",
    tagline: "Salida puntual y sin estrés",
    description:
      "Mismo servicio en sentido inverso, con salida puntual desde el hotel hacia el aeropuerto.",
    longDescription:
      "El servicio espejo del traslado de llegada: recogida puntual en el hotel con tiempo suficiente para el check-in del vuelo de salida.",
    price: 1200,
    priceUnit: "trayecto",
    capacity: "hasta 4 personas",
    duration: "45 min aprox.",
    times: ["Según horario de vuelo"],
    recommended: false,
    gradient: grad(0),
    image: img("1519641471654-76ce0107ad1b"),
  },
  {
    id: "t3",
    category: "transporte",
    name: "Chofer privado por día",
    location: "Los Cabos",
    tagline: "Vehículo y conductor a disposición",
    description:
      "Vehículo y conductor a disposición para explorar la zona a tu propio ritmo, sin horarios fijos.",
    longDescription:
      "Un conductor y vehículo privado disponibles durante toda la jornada para moverse entre restaurantes, actividades y puntos de interés sin depender de traslados individuales.",
    price: 4500,
    priceUnit: "día",
    capacity: "hasta 4 personas",
    duration: "8 hrs",
    times: ["08:00", "09:00", "10:00"],
    recommended: false,
    gradient: grad(1),
    image: img("1550355191-aa8a80b41353"),
  },
  {
    id: "t4",
    category: "transporte",
    name: "SUV de lujo VIP (grupo grande)",
    location: "Los Cabos",
    tagline: "Suburban / Escalade para grupos",
    description:
      "Traslado en Suburban o Escalade para grupos que buscan más espacio y comodidad.",
    longDescription:
      "Ideal para familias grandes o grupos de amigos, este servicio ofrece vehículos SUV de lujo tipo Suburban o Escalade con espacio adicional para pasajeros y equipaje.",
    price: 2200,
    priceUnit: "trayecto",
    capacity: "hasta 6 personas",
    duration: "45 min aprox.",
    times: ["Según horario de vuelo"],
    recommended: false,
    gradient: grad(2),
    image: img("1494976388531-d1058494cdd8"),
  },
];

export const ALL_SERVICES = [
  ...RESTAURANTS,
  ...ACTIVITIES,
  ...BOATS,
  ...TRANSPORT,
];

export const PACKAGES = [
  {
    id: "p1",
    name: "Luna de miel",
    description: "Cenas frente al mar, catamarán al atardecer y traslados privados.",
    serviceIds: ["t1", "r2", "b4", "r4", "t2"],
  },
  {
    id: "p2",
    name: "Aventura en familia",
    description: "Tirolesas, snorkel en El Arco, camellos y transporte VIP para el grupo.",
    serviceIds: ["t1", "a3", "a7", "a2", "t4"],
  },
  {
    id: "p3",
    name: "Fin de semana de pesca",
    description: "Jornada completa de pesca deportiva, cena de mariscos y chofer privado.",
    serviceIds: ["t1", "b2", "r8", "t3"],
  },
];

export const EXCHANGE_RATE_MXN_USD = 18.5;
