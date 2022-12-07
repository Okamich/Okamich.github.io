/* Health Bar code - Start */
window.Health = function (CurHP, MaxHP, BarID, Horizontal, Container) {
	if (Container == undefined) {
		Container = document;
	}
	var HP = parseInt((CurHP / MaxHP) * 100).clamp(0, 100);
	var BarElement = $(Container).find("#" + BarID);
	if (Horizontal) {
		BarElement.css({ width: HP + "%" });
	} else {
		BarElement.css({ height: HP + "%" });
	}
	BarElement.attr("title", CurHP + "/" + MaxHP + " HP");
	$(Container).find("#" + BarID + "bkg").attr("title", CurHP + "/" + MaxHP + " HP");
};
/* Health Bar code - End */
/* Experience Bar code - Start */
window.Experience = function (CurEXP, MaxEXP, BarID, Horizontal, Container) {
	if (Container == undefined) {
		Container = document;
	}
	var EXP = parseInt((CurEXP / MaxEXP) * 100).clamp(0, 100);
	var BarElement = $(Container).find("#" + BarID);
	if (Horizontal) {
		BarElement.css({ width: EXP + "%" });
	} else {
		BarElement.css({ height: EXP + "%" });
	}
	BarElement.attr("title", CurEXP + "/" + MaxEXP + " EXP");
	$(Container).find("#" + BarID + "bkg").attr("title", CurEXP + "/" + MaxEXP + " EXP");
};
/* Experience Bar code - End */
