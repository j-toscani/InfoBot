"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBahnInfoMessage = exports.createStopString = exports.createReadableJourneyData = exports.getJourneyData = exports.getLocationIds = void 0;
const hafas_client_1 = __importDefault(require("hafas-client"));
const db_1 = __importDefault(require("hafas-client/p/db"));
const client = hafas_client_1.default(db_1.default, "Inf9Bot");
function getLocationIds(start, end) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = {
                fuzzy: false,
                results: 1,
                stops: true,
                addresses: true,
                poi: true,
                subStops: true,
                entrances: false,
                linesOfStops: false,
                language: "de",
            };
            const fromRequest = client.locations(start, options);
            const toRequest = client.locations(end, options);
            const [fromStations, toStations] = yield Promise.all([
                fromRequest,
                toRequest,
            ]);
            const from = (_a = fromStations[0]) === null || _a === void 0 ? void 0 : _a.id;
            const to = (_b = toStations[0]) === null || _b === void 0 ? void 0 : _b.id;
            return {
                from,
                to,
            };
        }
        catch (error) {
            console.log(error);
            return {
                from: undefined,
                to: undefined,
            };
        }
    });
}
exports.getLocationIds = getLocationIds;
function getJourneyData(from, to) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const journeys = (_a = (yield client.journeys(from, to, { results: 1 }))) === null || _a === void 0 ? void 0 : _a.journeys;
            if (!journeys) {
                throw "No Journeys available";
            }
            return journeys;
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    });
}
exports.getJourneyData = getJourneyData;
function createDisplayTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()} Uhr`;
}
function createReadableJourneyData(journey) {
    const stops = journey.legs.map((leg) => {
        var _a;
        const { origin, destination, line } = leg;
        const stopInformation = {
            line: ((_a = leg.line) === null || _a === void 0 ? void 0 : _a.name) || (line === null || line === void 0 ? void 0 : line.additionalName) || "Unbekannt",
            peopleOnTrain: leg.loadFactor,
            from: origin.name,
            departure: (leg === null || leg === void 0 ? void 0 : leg.departure) ? createDisplayTime(leg.departure)
                : "Unbekannt",
            departurePlatform: leg.departurePlatform,
            direction: leg.direction || "Unbekannt",
            to: destination.name,
            arrival: (leg === null || leg === void 0 ? void 0 : leg.arrival) ? createDisplayTime(leg.arrival) : "Unbekannt",
            arrivalPlatform: leg.arrivalPlatform,
        };
        return stopInformation;
    });
    return stops;
}
exports.createReadableJourneyData = createReadableJourneyData;
function createStopString(obj) {
    return `Von ${obj.from} mit Linie ${obj.line} am Gleis ${obj.departurePlatform} um ${obj.departure} nach ${obj.to} Richtung ${obj.direction}. Ankunft auf Gleis ${obj.arrivalPlatform} um ${obj.arrival}. ${obj.peopleOnTrain ? 'Auslastung: ' + obj.peopleOnTrain : ''}`;
}
exports.createStopString = createStopString;
function createBahnInfoMessage(readableData, journeyString) {
    return `Diese Verbindung hat ${journeyString.length > 1 ? 'einen Stopp' : journeyString.length + ' Stopps'} . Die Reise dauert vermutlich von ${readableData[0].departure} bis ${readableData[readableData.length - 1].arrival} \n` + journeyString.join("\n \n");
}
exports.createBahnInfoMessage = createBahnInfoMessage;
function handleBahnCommand(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) {
                const [_command, start, end] = ctx.message.text.split(" ");
                const { from, to } = yield getLocationIds(start, end);
                if (!from || !to) {
                    ctx.reply("Was not able to find connection");
                    return;
                }
                ctx.reply("I found a connection for you!");
                const journeys = yield getJourneyData(from, to);
                if (!journeys) {
                    ctx.reply("Was not able to find journeys");
                    return;
                }
                const readableData = createReadableJourneyData(journeys[0]);
                const journeyString = readableData.map((stop, index) => {
                    const stopString = createStopString(stop);
                    return `Informationen zu Stop Nummer: ${index + 1} \n${stopString}`;
                });
                if (!ctx.chat) {
                    throw "No ChatID found";
                }
                const botMessage = createBahnInfoMessage(readableData, journeyString);
                ctx.telegram.sendMessage(ctx.chat.id, botMessage);
            }
            else {
                ctx.reply("This command is not valid. Format is: '/bahn '<start>' '<ende>'");
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = handleBahnCommand;
//# sourceMappingURL=bahn.js.map