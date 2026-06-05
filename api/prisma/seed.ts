import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.team.upsert({
    where: { name: 'Spain' },
    update: {},
    create: {
      name: 'Spain',
      players: {
        create: [
          // GOALKEEPERS
          { name: 'David Raya' },
          { name: 'Alex Remiro' },
          { name: 'Robert Sánchez' },

          // DEFENDERS
          { name: 'Dani Carvajal' },
          { name: 'Robin Le Normand' },
          { name: 'Dani Vivian' },
          { name: 'Aymeric Laporte' },
          { name: 'Marc Cucurella' },
          { name: 'Alejandro Grimaldo' },
          { name: 'Pau Cubarsí' },
          { name: 'Oscar Mingueza' },

          // MIDFIELDERS
          { name: 'Rodri' },
          { name: 'Martín Zubimendi' },
          { name: 'Fabián Ruiz' },
          { name: 'Pedri' },
          { name: 'Dani Olmo' },
          { name: 'Alex Baena' },
          { name: 'Aleix García' },

          // FORWARDS
          { name: 'Lamine Yamal' },
          { name: 'Nico Williams' },
          { name: 'Ferran Torres' },
          { name: 'Mikel Oyarzabal' },
          { name: 'Álvaro Morata' },
          { name: 'Joselu' },
          { name: 'Ayoze Pérez' },
          { name: 'Bryan Zaragoza' },
        ],
      },
    },
  });
  await prisma.team.upsert({
    where: { name: 'Cape Verde' },
    update: {},
    create: {
      name: 'Cape Verde',
      players: {
        create: [
          // GOALKEEPERS
          { name: 'Vozinha' },
          { name: 'Bruno Varela' },
          { name: 'Dylan Silva' },

          // DEFENDERS
          { name: 'Roberto Lopes' },
          { name: 'Logan Costa' },
          { name: 'Diney Borges' },
          { name: 'Dylan Tavares' },
          { name: 'Stopira' },
          { name: 'Steven Moreira' },
          { name: 'Kelven Gomes' },
          { name: 'Pico' },

          // MIDFIELDERS
          { name: 'Jamiro Monteiro' },
          { name: 'Patrick Andrade' },
          { name: 'Kenny Rocha Santos' },
          { name: 'Deroy Duarte' },
          { name: 'Kevin Pina' },
          { name: 'Cuca' },
          { name: 'Laros Duarte' },

          // FORWARDS
          { name: 'Ryan Mendes' },
          { name: 'Garry Rodrigues' },
          { name: 'Bebé' },
          { name: 'Jovane Cabral' },
          { name: 'Hélio Varela' },
          { name: 'Dailon Livramento' },
          { name: 'Bryan Teixeira' },
          { name: 'Gilson Tavares' },
        ],
      },
    },
  });

  // =========================
  // 🇲🇽 MEXICO
  // =========================
  await prisma.team.upsert({
    where: { name: 'Mexico' },
    update: {},
    create: {
      name: 'Mexico',
      players: {
        create: [
          // GOALKEEPERS
          { name: 'Carlos Acevedo' },
          { name: 'Guillermo Ochoa' },
          { name: 'Raúl Rangel' },

          // DEFENDERS
          { name: 'Jesús Gallardo' },
          { name: 'Israel Reyes' },
          { name: 'César Montes' },
          { name: 'Jorge Sánchez' },
          { name: 'Johan Vásquez' },
          { name: 'Mateo Chávez' },

          // MIDFIELDERS
          { name: 'Gilberto Mora' },
          { name: 'Edson Álvarez' },
          { name: 'Orbelín Pineda' },
          { name: 'Luis Romo' },
          { name: 'Brian Gutiérrez' },
          { name: 'Obed Vargas' },
          { name: 'César Huerta' },
          { name: 'Luis Chávez' },
          { name: 'Erik Lira' },
          { name: 'Álvaro Fidalgo' },
          { name: 'Roberto Alvarado' },

          // FORWARDS
          { name: 'Armando González' },
          { name: 'Raúl Jiménez' },
          { name: 'Julián Quiñones' },
          { name: 'Santiago Giménez' },
          { name: 'Guillermo Martínez' },
          { name: 'Alexis Vega' },
        ],
      },
    },
  });

  // =========================
  // 🇿🇦 SOUTH AFRICA
  // =========================
  await prisma.team.upsert({
    where: { name: 'South Africa' },
    update: {},
    create: {
      name: 'South Africa',
      players: {
        create: [
          // GOALKEEPERS
          { name: 'Ronwen Williams' },
          { name: 'Ricardo Goss' },
          { name: 'Sipho Chaine' },

          // DEFENDERS
          { name: 'Khuliso Mudau' },
          { name: 'Aubrey Modiba' },
          { name: 'Khulumani Ndamane' },
          { name: 'Olwethu Makhanya' },
          { name: 'Bradley Cross' },
          { name: 'Thabang Matuludi' },
          { name: 'Nkosinathi Sibisi' },
          { name: 'Kamogelo Sebelebele' },
          { name: 'Ime Okon' },
          { name: 'Samukele Kabini' },

          // MIDFIELDERS
          { name: 'Teboho Mokoena' },
          { name: 'Jayden Adams' },
          { name: 'Thalente Mbatha' },
          { name: 'Sphephelo Sithole' },

          // FORWARDS
          { name: 'Oswin Appollis' },
          { name: 'Tshepang Moremi' },
          { name: 'Evidence Makgopa' },
          { name: 'Lyle Foster' },
          { name: 'Iqraam Rayners' },
          { name: 'Relebohile Mofokeng' },
          { name: 'Themba Zwane' },
          { name: 'Thapelo Maseko' },
        ],
      },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
