const Discord = require("discord.js");
const axios = require("axios").default;
const { prefix, token } = require("./config.json");
const client = new Discord.Client();

const swears = [
  "Putang ina mo ",
  "Walang hiya ka ",
  "Tae mo ",
  "Punyeta ka ",
  "Gago ka ",
  "Pakshet ka ",
  "Buwisit ka ",
  "Letse ka ",
  "Hayop ka ",
  "Lintik ka ",
];

function commaized(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function countryInfo(obj) {
  const country = obj.country === null ? "no data" : obj.country;
  const cases = obj.cases === null ? "no data" : commaized(obj.cases);
  const deaths = obj.deaths === null ? "no data" : commaized(obj.deaths);
  const recovered =
    obj.recovered === null ? "no data" : commaized(obj.recovered);
  const active = obj.active === null ? "no data" : commaized(obj.active);

  const val = {
    name: country,
    value:
      "✅   Cases: " +
      cases +
      "\n\n❎   Deaths: " +
      deaths +
      "\n\n🏥   Recovered: " +
      recovered +
      "\n\n☢️   Active: " +
      active,
  };

  return val;
}

function recreate(message) {
  const name = message.channel.name;
  message.channel.delete();
  message.guild.channels.create(name, { type: "text" });
}

client.once("ready", () => {
  console.log("ready!");
});

client.on("message", (message) => {
  const msg = message.content;

  if (msg.startsWith(`${prefix}help`)) {
    let embed = new Discord.MessageEmbed()
      .setTitle("Available Commands")
      .addFields(
        {
          name: "~tt <@user>",
          value: "ex: ~tt @natoy",
        },
        {
          name: "~search <query>",
          value: "ex: ~search Prince Carlo Juguilon",
        },
        {
          name: "~corona",
          value: "corona data for whole world",
        },
        {
          name: "~corona all",
          value: "corona data for all countries",
        },
        {
          name: "~corona <country>",
          value: "ex: ~corona Philippines",
        }
      );
    message.channel.send(embed);
  }

  if (msg.startsWith(`${prefix}recreate`)) {
    recreate(message);
  }

  if (msg.startsWith(`${prefix}tt`)) {
    let i = Math.floor(Math.random() * swears.length);
    let member = message.mentions.members.first();
    let username = member.user.username;
    message.channel.send(swears[i] + username);
    message.guild.channels.create;
  }

  if (msg.startsWith(`${prefix}whoami`)) {
    message.reply(message.author.avatarURL());
  }

  if (msg.startsWith(`${prefix}corona`)) {
    if (msg.split(" ").length <= 1) {
      message.channel.send("getting Coronavirus Data...");
      axios
        .get("https://coronavirus-19-api.herokuapp.com/all")
        .then((response) => {
          const data = response.data;
          const embed = new Discord.MessageEmbed()
            .setTitle("All Coronavirus Data")
            .addFields(
              {
                name: "Cases",
                value: commaized(data.cases),
              },
              {
                name: "Deaths",
                value: commaized(data.deaths),
              },
              {
                name: "Recovered",
                value: commaized(data.recovered),
              }
            );
          message.channel.send(embed);
        })
        .catch(() => {
          message.channel.send("something went wrong. :(");
        });
    } else {
      const param = msg.substr(msg.indexOf(" ") + 1);

      if (param === "all") {
        axios
          .get("https://coronavirus-19-api.herokuapp.com/countries")
          .then((response) => {
            const data = response.data;
            let embed = new Discord.MessageEmbed()
              .setTitle("All Countries")
              .addFields(
                data.map((country) => {
                  return {
                    name: country.country,
                    value: commaized(country.cases),
                  };
                })
              );
            message.channel.send(embed);
          })
          .catch(() => {
            message.channel.send("something went wrong. :(");
          });
      } else {
        axios
          .get("https://coronavirus-19-api.herokuapp.com/countries/" + param)
          .then((response) => {
            const data = response.data;
            let embed = new Discord.MessageEmbed()
              .setTitle("Corona Data for " + data.country)
              .addFields(countryInfo(data));
            message.channel.send(embed);
          })
          .catch(() => {
            message.channel.send("something went wrong. :(");
          });
      }
    }
  }

  if (msg.startsWith(`${prefix}search`)) {
    if (msg.split(" ").length > 1) {
      const query = msg.substr(msg.indexOf(" ") + 1);

      const parseSearch = (obj) => {
        return {
          name: obj.title,
          value: obj.link,
        };
      };

      message.channel.send("searching results for: " + query + "...");

      axios
        .get(
          "https://google-search3.p.rapidapi.com/api/v1/search/q=" +
            query +
            "&num=10",
          {
            headers: {
              "x-rapidapi-host": "google-search3.p.rapidapi.com",
              "x-rapidapi-key":
                "c745923f57msh3a7756dc503b376p1da606jsn55ed09519301",
              useQueryString: true,
            },
          }
        )
        .then((response) => {
          const data = response.data;
          let embed = new Discord.MessageEmbed()
            .setTitle("Search Results for: " + query)
            .addFields(data.results.map((search) => parseSearch(search)));
          message.channel.send(embed);
        })
        .catch(() => {
          message.channel.send("something went wrong. :(");
        });
    }
  }
});

client.login(token);
