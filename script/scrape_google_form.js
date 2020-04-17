"use strict";

const cheerio = require("cheerio");
const request = require("request");
const jsonframe = require("jsonframe-cheerio");

const frame_google = {
  quiz: {
    _s: ".freebirdFormviewerViewItemsItemItem",
    _d: [
      {
        question:
          ".freebirdFormviewerViewItemsItemItemTitle.exportItemTitle.freebirdCustomFont",
        points:
          ".freebirdFormviewerViewItemsItemScore.freebirdFormviewerViewItemsItemHint",
        checkbox: [
          ".freebirdFormviewerViewItemsCheckboxOptionContainer < .docssharedWizToggleLabeledLabelText.exportLabel.freebirdFormviewerViewItemsCheckboxLabel",
        ],
        radio: [
          ".freebirdFormviewerViewItemsRadioOptionContainer < .docssharedWizToggleLabeledLabelText.exportLabel.freebirdFormviewerViewItemsRadioLabel",
        ],
        grid_col: [
          ".freebirdFormviewerViewItemsGridScrollContainer .freebirdFormviewerViewItemsGridRow.freebirdFormviewerViewItemsGridColumnHeader .freebirdFormviewerViewItemsGridCell",
        ],
        grid_row: [
          ".freebirdFormviewerViewItemsGridRow.freebirdFormviewerViewItemsGridUngraded < .freebirdFormviewerViewItemsGridCell.freebirdFormviewerViewItemsGridRowHeader",
        ],
      },
    ],
  },
};
const get_google_form = (url) => {
  return new Promise((res, rej) => {
    try {
      request.get(url, (error, response, data) => {
        const $ = cheerio.load(data);
        jsonframe($);
        let dataTores = $("body")
          .scrape(frame_google)
          .quiz.map((el) => {
            Object.keys(el).forEach((prop) => {
              if (el[prop].length == 0) delete el[prop];
              else if (Array.isArray(el[prop])) el[prop] = el[prop].sort();
            });
            return el;
          })
          .filter((el) => el.points != undefined)
          .sort((a, b) => {
            return a.points.localeCompare(b.points); //ordine crescente
          });
        res(dataTores);
      });
    } catch (e) {
      res([]);
    }
  });
};

module.exports = { get_google_form };
