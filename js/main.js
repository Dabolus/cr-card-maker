/*
function clearSelection() {
	if ( document.selection ) {
		document.selection.empty();
	} else if ( window.getSelection ) {
		window.getSelection().removeAllRanges();
	}
}
*/
Element.prototype.remove = function() {
	this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
	for(var i = this.length - 1; i >= 0; i--) {
		if(this[i] && this[i].parentElement) {
			this[i].parentElement.removeChild(this[i]);
		}
	}
}

var cmbRarity = document.getElementById("cmbRarity");
var cmbLevel = document.getElementById("cmbLevel");
var cmbType = document.getElementById("cmbType");
var cmbElixirCost = document.getElementById("cmbElixirCost");
var cmbLanguage = document.getElementById("cmbLanguage");
var cmbWebsiteLanguage = document.getElementById("cmbCountries");
var lblName = document.getElementById("lblName");
var txtDescription = document.getElementById("txtDescription");
var fcImage = document.getElementById("fcImage");
var fcCard = document.getElementById("fcCard");
var tblProperties = document.getElementById("tblProperties");

var nbrDonationAmount = document.getElementById("nbrDonationAmount");

var frmAddProperty = document.getElementById("frmAddProperty");
var btnAddProperty = document.getElementById("btnAddProperty");

var iconsEnabled = false;

var noCropImg = document.getElementById("noCropImg");
var cropImg = document.getElementById("cropImg");

var imgInfo = new Image();
imgInfo.src = "img/info.png";
var legGradient = new Image();
legGradient.src = "img/legendary.png";
legGradient.width = "300";
console.log(legGradient);

function getSelectedRarity() {
	return {
		value: cmbRarity.options[cmbRarity.selectedIndex].value,
		text: cmbRarity.options[cmbRarity.selectedIndex].text
	};
}
function getSelectedLevel() {
	return cmbLevel.options[cmbLevel.selectedIndex].text;
}
function getSelectedLanguage() {
	return cmbLanguage.options[cmbLanguage.selectedIndex].value;
}
function getSelectedWebsiteLanguage() {
	return cmbWebsiteLanguage.options[cmbWebsiteLanguage.selectedIndex].value;
}
function getSelectedType() {
	return cmbType.options[cmbType.selectedIndex].value;
}
function getSelectedElixirCost() {
	return cmbElixirCost.options[cmbElixirCost.selectedIndex].text;
}
function getSelectedPropertyIcon() {
	var cmbPropertyIcon = frmAddProperty.elements["cmbPropertyIcon"];
	return {
		value: cmbPropertyIcon.options[cmbPropertyIcon.selectedIndex].value,
		text: cmbPropertyIcon.options[cmbPropertyIcon.selectedIndex].text
	}
}

WebFont.load({
	custom: {
		families: [ "Supercell Magic", "SC CCBackBeat" ],
		urls: [ "css/fonts.css" ]
	},
	active: function() { generateCard(); }
});

var Locales = {
	en: {
		website: {
			ctlLanguage: "Language:",
			ctlName: "Name:",
			ctlRarity: "Rarity:",
			ctlLevel: "Level:",
			ctlType: "Type:",
			ctlElixirCost: "Elixir cost:",
			ctlDescription: "Description:",
			ctlImage: "Image:",
			ctlProperties: "Properties:",
			lblName: "Enter name",
			ctlImageDesc: "Select an image that represents your card.",
			txtDescription: "Enter description...",
			cmbRarity: [ "Common", "Rare", "Epic", "Legendary" ],
			cmbType: [ "Troop", "Building", "Spell" ],
			btnAddCardProperty: "Add card property",
			btnDownload: "Save",

			ctlAddPropertyTitle: "Add card property",
			ctlPropertyName: "Name:",
			ctlPropertyValue: "Value:",
			ctlPropertyIcon: "Icon:",
			ctlExtras: "Extra:",
			cbxIconBgLbl: "Add icon background",
			cbxInfoBtnLbl: "Add [i] button",
			lblPropertyName: "Enter property name",
			lblPropertyValue: "Enter property value",
			cmbPropertyIcon: [
				"Hitpoints",
				"Shield Hitpoints",
				"DPS",
				"Damage",
				"Area Damage",
				"Tower Damage",
				"Death Damage",
				"Hit Speed",
				"Targets",
				"Speed",
				"Range",
				"Lifetime",
				"Deploy Time",
				"Stun Duration",
				"Radius",
				"Troop",
				"Count",
				"Boost",
				"Rage Effect",
				"Common Cards",
				"Rare Cards",
				"Epic Cards",
				"Legendary Cards",
				"Trophy",
				"Gold",
				"Elixir",
				"Dark Elixir",
				"Gems",
				"Transport",
				"Upgrade"
			],
			btnCancelProperty: "Cancel",
			btnAddProperty: "Add",

			ctlThName: "Name",
			ctlThValue: "Value",
			ctlThExtras: "Extras",
			ctlThIcon: "Icon"
		},
		card: {
			level: {
				text: "Level ",
				before: true,
				extra: ""
			},
			rarity: {
				text: "Rarity:",
				common: "Common",
				rare: "Rare",
				epic: "Epic",
				legendary: "Legendary"
			},
			type: {
				text: "Type:",
				troop: "Troop",
				building: "Building",
				spell: "Spell"
			}
		}
	},
	fr: {
		card: {
			level: {
				text: "de niveau ",
				before: false,
				extra: ""
			},
			rarity: {
				text: "Rareté :",
				common: "Commune",
				rare: "Rare",
				epic: "Épique",
				legendary: "Légendaire"
			},
			type: {
				text: "Type :",
				troop: "Combattant",
				building: "Bâtiment",
				spell: "Sort"
			}
		}
	},
	de: {
		card: {
			level: {
				text: "Level ",
				before: false,
				extra: ""
			},
			rarity: {
				text: "Seltenheit",
				common: "Gewöhnlich",
				rare: "Selten",
				epic: "Episch",
				legendary: "Legendär"
			},
			type: {
				text: "Typ",
				troop: "Einheit",
				building: "Gebäude",
				spell: "Zauber"
			}
		}
	},
	es: {
		card: {
			level: {
				text: "(nivel ",
				before: false,
				extra: ")"
			},
			rarity: {
				text: "Calidad:",
				common: "Común",
				rare: "Especial",
				epic: "Épica",
				legendary: "Legendaria"
			},
			type: {
				text: "Tipo:",
				troop: "Tropa",
				building: "Estructura",
				spell: "Hechizo"
			}
		}
	},
	it: {
		website: {
			ctlLanguage: "Lingua:",
			ctlName: "Nome:",
			ctlRarity: "Rarità:",
			ctlLevel: "Livello:",
			ctlType: "Tipo:",
			ctlElixirCost: "Costo:",
			ctlDescription: "Descrizione:",
			ctlImage: "Immagine:",
			ctlProperties: "Proprietà:",
			lblName: "Inserisci il nome",
			ctlImageDesc: "Seleziona un'immagine che rappresenta la tua carta.",
			txtDescription: "Inserisci la descrizione...",
			cmbRarity: [ "Comune", "Rara", "Epica", "Leggendaria" ],
			cmbType: [ "Truppa", "Edificio", "Incantesimo" ],
			btnAddCardProperty: "Aggiungi proprietà",
			btnDownload: "Salva",

			ctlAddPropertyTitle: "Aggiungi proprietà",
			ctlPropertyName: "Nome:",
			ctlPropertyValue: "Valore:",
			ctlPropertyIcon: "Icona:",
			ctlExtras: "Extra:",
			cbxIconBgLbl: "Aggiungi sfondo",
			cbxInfoBtnLbl: "Aggiungi il pulsante [i]",
			lblPropertyName: "Inserisci il nome",
			lblPropertyValue: "Inserisci il valore",
			cmbPropertyIcon: [
				"Punti ferita",
				"PF Scudo",
				"Danni al secondo",
				"Danno",
				"Danno ad area",
				"Danno torri",
				"Danni alla morte",
				"Velocità colpi",
				"Bersagli",
				"Velocità",
				"Portata",
				"Durata",
				"Tempo schieramento",
				"Stordimento",
				"Raggio",
				"Truppa",
				"Conteggio",
				"Potenziamento",
				"Effetto Furia",
				"Carte Comuni",
				"Carte Rare",
				"Carte Epiche",
				"Carte Leggendarie",
				"Trofeo",
				"Oro",
				"Elisir",
				"Elisir nero",
				"Gemma",
				"Trasporto",
				"Potenziamento"
			],
			btnCancelProperty: "Annulla",
			btnAddProperty: "Aggiungi",

			ctlThName: "Nome",
			ctlThValue: "Valore",
			ctlThExtras: "Extra",
			ctlThIcon: "Icona"
		},
		card: {
			level: {
				text: "livello ",
				before: false,
				extra: ""
			},
			rarity: {
				text: "Rarità:",
				common: "Comune",
				rare: "Rara",
				epic: "Epica",
				legendary: "Leggendaria"
			},
			type: {
				text: "Tipo:",
				troop: "Truppa",
				building: "Edificio",
				spell: "Incantesimo"
			}
		}
	},
	ja: {
		card: {
			level: {
				text: "レベル",
				before: true,
				extra: ""
			},
			rarity: {
				text: "レア度：",
				common: "ノーマル",
				rare: "レア",
				epic: "スーパーレア",
				legendary: "ウルトラレア"
			},
			type: {
				text: "タイプ：",
				troop: "ユニット",
				building: "建物",
				spell: "呪文"
			}
		}
	},
	pt: {
		website: {
			ctlLanguage: "Linguagem:",
			ctlName: "Nome:",
			ctlRarity: "Raridade:",
			ctlLevel: "Nível:",
			ctlType: "Tipo:",
			ctlElixirCost: "Custo de elixir:",
			ctlDescription: "Descrição:",
			ctlImage: "Imagem:",
			ctlProperties: "Atributos:",
			lblName: "Digite o nome",
			ctlImageDesc: "Selecione a imagem que vai representar a sua carta.",
			txtDescription: "Digite e a descrição...",
			cmbRarity: [ "Comum", "Rara", "Épica", "Lendária" ],
			cmbType: [ "Tropa", "Construção", "Feitiço" ],
			btnAddCardProperty: "Adicionar atributo",
			btnDownload: "Salvar",

			ctlAddPropertyTitle: "Adicionar atributo",
			ctlPropertyName: "Nome:",
			ctlPropertyValue: "Valor:",
			ctlPropertyIcon: "Ícone:",
			ctlExtras: "Extra:",
			cbxIconBgLbl: "Colocar fundo no ícone",
			cbxInfoBtnLbl: "Adicionar botão [i]",
			lblPropertyName: "Escolha o atributo",
			lblPropertyValue: "Escolha o valor",
			cmbPropertyIcon: [
				"Pontos de vida",
				"Vida do escudo",
				"Dano por segundo",
				"Dano",
				"Dano em área",
				"Dano à torres",
				"Dano de morte",
				"Velocidade de impacto",
				"Alvos",
				"Velocidade",
				"Alcance",
				"Tempo de vida",
				"Tempo de mobilização",
				"Duração do atordoamento",
				"Raio de alcance",
				"Tropa",
				"Quantidade",
				"Impulso",
				"Efeito de fúria",
				"Cartas Comuns",
				"Cartas Raras",
				"Cartas Épicas",
				"Cartas Lendárias",
				"Troféus",
				"Ouro",
				"Elixir",
				"Elixir Negro",
				"Gemas",
				"Locomoção",
				"Melhoria"
			],
			btnCancelProperty: "Cancelar",
			btnAddProperty: "Adicionar",

			ctlThName: "Nome",
			ctlThValue: "Valor",
			ctlThExtras: "Extras",
			ctlThIcon: "Ícone"
		},
		card: {
			level: {
				text: "Nível ",
				before: false,
				extra: ""
			},
			rarity: {
				text: "Rarirade:",
				common: "Comum",
				rare: "Rara",
				epic: "Épica",
				legendary: "Lendária"
			},
			type: {
				text: "Tipo:",
				troop: "Tropa",
				building: "Construção",
				spell: "Feitiço"
			}
		}
	}
};

var Rarities = {
	common: {
		color: "#666",
		maxLevel: 13,
		shape: "img/cards/normal.png"
	},
	rare: {
		color: "#FDA03C",
		maxLevel: 11,
		shape: "img/cards/normal.png"
	},
	epic: {
		color: "#C3F",
		maxLevel: 8,
		shape: "img/cards/normal.png"
	},
	legendary: {
		color: "#65BABA",
		maxLevel: 5,
		shape: "img/cards/legendary.png"
	}
};

var canvas = document.getElementById('card-canvas');
var ctx = canvas.getContext('2d');
var img = new Image();

/*
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
	var lines = text.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var words = lines[i].split(' ');
		while ((words.length > 1) && (ctx.measureText(words.join(' ')).width > maxWidth)) {
			lines[i + 1] = words.pop() + " " + lines[i + 1];
		}
		if (words.length == 1) {
			lines[i + 1] = " " + lines[i + 1];
			while (ctx.measureText(words[0]).width > maxWidth) {
				lines[i + 1] = words[0].slice(-1, 0) + lines[i + 1];
				words[0] = words[0].slice(0, -1);
			}
		}
		ctx.fillText(words.join(' '), x, (lineHeight*i)+y);
	}
}
*/

function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > maxWidth && n > 0) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	context.fillText(line, x, y);
}

var legGradientIndex = 0;
function drawProperty(icon, title, value, dark, iconBackground, info, x, y) {
	ctx.translate(x, y);

	// Background
	ctx.save();
	ctx.fillStyle = dark ? "#C2D3DB" : "#FDFEFE";
	ctx.beginPath();
	ctx.rect(0, 0, 567, 110);
	ctx.fill();
	ctx.restore();

	// Title
	ctx.save();
	ctx.textAlign = "left";
	ctx.textBaseline = "hanging";

	var fontSize = 40;
	ctx.font = "40px 'Supercell Magic'";
	ctx.fillStyle = "#333";
	while ((fontSize > 1) && (ctx.measureText(title).width > 440)) {
		fontSize--;
		ctx.font = fontSize + "px 'Supercell Magic'";
	}
	ctx.fillText(title, 109, 16);

	fontSize = 48;
	ctx.font = "48px 'Supercell Magic'";
	ctx.fillStyle = "white";
	ctx.strokeStyle = "black";
	ctx.shadowColor = "black";
	ctx.lineWidth = 4;
	ctx.shadowOffsetY = 4;
	while ((fontSize > 1) && (ctx.measureText(value).width > 440)) {
		fontSize--;
		ctx.font = fontSize + "px 'Supercell Magic'";
	}
	ctx.strokeText(value, 109, 57);
	ctx.fillText(value, 109, 57);
	ctx.restore();

	// Info button
	if (info)
		ctx.drawImage(imgInfo, 485, 18, 65, 67);

	// Icon background
	if (iconBackground) {
		ctx.save();
		ctx.fillStyle = "#575E62";
		ctx.beginPath();
		ctx.moveTo(13, 8);
		ctx.lineTo(96, 8);
		ctx.quadraticCurveTo(102, 8, 102, 14);
		ctx.lineTo(102, 97);
		ctx.quadraticCurveTo(102, 103, 96, 103);
		ctx.lineTo(13, 103);
		ctx.quadraticCurveTo(7, 103, 7, 97);
		ctx.lineTo(7, 14);
		ctx.quadraticCurveTo(7, 8, 13, 8);
		ctx.fill();
		ctx.restore();
	}

	// Icon
	ctx.drawImage(icon, 2, 3, 105, 105);
}

function generateCard() {
	var bg = new Image();
	bg.src = "img/bg.png";
	var elixir, contour;
	bg.onload = function() {
		var rarity = getSelectedRarity();
		// BACKGROUND
		ctx.translate(0, 0);
		ctx.drawImage(this, 0, 0, this.width, this.height);
		ctx.save();
		// CARD CONTOUR
		contour = new Image();
		contour.src = Rarities[rarity.value].shape;
		contour.onload = function() {
			// ELIXIR
			elixir = new Image();
			elixir.src = "img/elixir.png";
			elixir.onload = function() {
				var level = getSelectedLevel();
				var type = getSelectedType();
				var elixirCost = getSelectedElixirCost();
				var name = lblName.value;
				var description = txtDescription.value;
				var language = getSelectedLanguage();

				// CARD NAME
				ctx.save();
				// Font
				ctx.font = "70px 'Supercell Magic'";
				// Alignment
				ctx.textAlign = "center";
				ctx.textBaseline = "hanging";
				// Stroke
				ctx.lineWidth = 6;
				ctx.fillStyle = "white";
				ctx.strokeStyle = "black";
				// Shadow on the lower side
				ctx.shadowOffsetY = 5;
				ctx.shadowColor = "black";
				var shownName = "";
				if (Locales[language].card.level.before)
					shownName = Locales[language].card.level.text + level + Locales[language].card.level.extra + " " + name;
				else
					shownName = name + " " + Locales[language].card.level.text + level + Locales[language].card.level.extra;

				ctx.strokeText(shownName, 716, 50);
				ctx.fillText(shownName, 716, 50);
				ctx.restore();


				// IMAGE
				ctx.save();
				ctx.translate(88, 215);
				// Border
				ctx.save();
				ctx.beginPath();
				if (rarity.value === "legendary") {
					ctx.moveTo(211, 17);
					ctx.lineTo(385, 81);
					ctx.lineTo(385, 445);
					ctx.lineTo(211, 510);
					ctx.lineTo(35, 445);
					ctx.lineTo(35, 81);

					ctx.clip();
				} else {
					ctx.moveTo(52, 34);
					ctx.lineTo(371, 34);
					ctx.quadraticCurveTo(397, 34, 397, 60);
					ctx.lineTo(397, 469);
					ctx.quadraticCurveTo(397, 495, 371, 495);
					ctx.lineTo(52, 495);
					ctx.quadraticCurveTo(26, 495, 26, 469);
					ctx.lineTo(26, 60);

					ctx.clip();
				}
				// Image
				if (img.src !== "") {
					try {
						ctx.drawImage(img, 32, 34, 360, 460);
					} catch(e) {
						swal("Error", "There was an error with your image, please try again.", "error");
					}
				}
				ctx.restore();
				if (rarity.value === "legendary")
					ctx.drawImage(contour, 18, 0, 386, 529);
				else
					ctx.drawImage(contour, 18, 27, 385, 477);

				// Elixir cost
				// Drop
				ctx.drawImage(elixir, 0, 15, 105, 125);
				// Number
				// Font
				ctx.font = "70px 'Supercell Magic'";
				// Alignment
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				// Stroke
				ctx.lineWidth = 6;
				ctx.fillStyle = "#FFE9FF";
				ctx.strokeStyle = "#760088";
				// Shadow on the lower side
				ctx.shadowOffsetY = 5;
				ctx.shadowColor = "#760088";
				ctx.strokeText(elixirCost, 52, 77);
				ctx.fillText(elixirCost, 52, 77);
				ctx.restore();


				// RARITY AND TYPE
				ctx.save();
				ctx.translate(558, 207)
				ctx.fillStyle = Rarities[rarity.value].color;
				ctx.beginPath();
				ctx.moveTo(15, 0);
				ctx.lineTo(758, 0);
				ctx.quadraticCurveTo(773, 0, 773, 15);
				ctx.lineTo(773, 127);
				ctx.quadraticCurveTo(773, 157, 758, 157);
				ctx.lineTo(15, 157);
				ctx.quadraticCurveTo(0, 157, 0, 142);
				ctx.lineTo(0, 15);
				ctx.quadraticCurveTo(0, 0, 15, 0);
				ctx.fill();


				ctx.font = "48px 'Supercell Magic'";
				ctx.fillStyle = "white";
				ctx.textBaseline = "hanging";

				ctx.fillText(Locales[language].card.rarity.text, 17, 23);
				ctx.fillText(Locales[language].card.type.text, 392, 23);


				ctx.font = "54px 'Supercell Magic'";
				ctx.lineWidth = 5;
				ctx.strokeStyle = "black";
				ctx.fillStyle = "white";
				// Shadow on the lower side
				ctx.shadowOffsetY = 5;
				ctx.shadowColor = "black";

				ctx.strokeText(Locales[language].card.type[type], 394, 88);
				ctx.fillText(Locales[language].card.type[type], 394, 88);

				if (rarity.value === "legendary") {
					//[ "#F9F", "#FCFF96", "#9AFF66", "#FF9BFE", "#FCFF96", "#9AFF66", "#F9F" ]
/*					var colors = [ "#FF9", "#66FFFC", "#9F6", "white", "#F9F" ];
					var rand = Math.floor(Math.random() * 5);

					var gradient = ctx.createLinearGradient(0, 0, 380, 0);
					gradient.addColorStop("0", colors[rand]);
					gradient.addColorStop("0.5", colors[(rand + 1) % 5]);
					gradient.addColorStop("1.0", colors[(rand + 2) % 5]);
					ctx.fillStyle = gradient;*/
					var pat = ctx.createPattern(legGradient, "repeat-x");
					ctx.fillStyle = pat;
				}
				ctx.strokeText(Locales[language].card.rarity[rarity.value], 18, 88);
				ctx.fillText(Locales[language].card.rarity[rarity.value], 18, 88);
				ctx.restore();

				// DESCRIPTION
				ctx.save();
				// Font
				ctx.font = "42px 'SC CCBackBeat'";
				// Alignment
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.fillStyle = "#333";

				wrapText(ctx, description, 940, 440, 702, 54);
				ctx.restore();

				// PROPERTIES
				var properties = document.getElementsByClassName("prpRow");

				for (var i = properties.length - 1; i >= 0; i--) {
					ctx.save();

					var property = properties[i].getElementsByTagName("td");
					var rowIndex = Math.floor(i / 2);
					var dark = ((rowIndex % 2) == 0) ? true : false;
					var x = ((i % 2) == 0) ? 133 : 721;
					var y = (rowIndex * 120) + 889;
					drawProperty(property[3].firstChild, property[0].innerText, property[1].innerText, dark, property[2].getElementsByClassName("cbxIconBg")[0].checked, property[2].getElementsByClassName("cbxInfoBtn")[0].checked, x, y);

					ctx.restore();
				}
			};
		};
	};
}

cmbRarity.onchange = function() {
	var level = getSelectedLevel();
	var newRarity = getSelectedRarity().value;
	if (level > Rarities[newRarity].maxLevel)
		level = Rarities[newRarity].maxLevel;
	var optionsAsString = "";
	for (var i = 1; i <= Rarities[newRarity].maxLevel; i++) {
		optionsAsString += "<option";
		if (level == i)
			optionsAsString += " selected";
		optionsAsString += ">" + i + "</option>";
	}
	cmbLevel.innerHTML = optionsAsString;
	generateCard();
}
cmbLanguage.onchange = generateCard;
cmbWebsiteLanguage.onchange = function() {
	setWebsiteTranslation(getSelectedWebsiteLanguage());
}
cmbLevel.onchange = generateCard;
cmbType.onchange = generateCard;
cmbElixirCost.onchange = generateCard;
lblName.onchange = generateCard;
lblName.onkeydown = function(e) {
	var key = e.keyCode || e.charCode;

	if(key == 13)
		e.preventDefault();
	else if ((key == 8) || ((key > 31) && (key != 127)))
		generateCard();
}
txtDescription.onchange = generateCard;
txtDescription.onkeydown = function(e) {
	var key = e.keyCode || e.charCode;

	if(key == 13)
		e.preventDefault();
	else if ((key == 8) || ((key > 31) && (key != 127)))
		generateCard();
}
fcImage.onchange = function() {
	var file = fcImage.files[0];
	var reader = new FileReader();

	reader.onloadend = function() {
		var cropper;
		var imgContainer = document.getElementById("imgContainer");
		var tmpimg = new Image();
		tmpimg.src = reader.result;
		if (tmpimg.width > tmpimg.height) {
			var ar = tmpimg.height / tmpimg.width
			tmpimg.width = 1024;
			tmpimg.height = ar * 1024;
		} else {
			var ar = tmpimg.width / tmpimg.height;
			tmpimg.height = 1024;
			tmpimg.width = ar * 1024;
		}
		imgContainer.appendChild(tmpimg);
		$("#mdlImgEditor").on("shown.bs.modal", function() {
			cropper = new Cropper(tmpimg, {
				autoCropArea: 0.5,
				dragMode: "move",
				rotatable: false,
				aspectRatio: 18/23
			})
		}).on("hidden.bs.modal", function() {
//			cropper.destroy();
			while (imgContainer.firstChild)
				imgContainer.removeChild(imgContainer.firstChild);
			fcImage.value = null;
			generateCard();
		});

		noCropImg.onclick = function() {
			img.src = tmpimg.src;
			$('mdlImgEditor').modal('hide');
			document.getElementById("filename").innerHTML = file.name;
		}
		cropImg.onclick = function() {
			var data = cropper.getData();
			var tmpcanvas = document.createElement('canvas');
			tmpcanvas.width = tmpimg.width;
			tmpcanvas.height = tmpimg.height;
			tmpcanvas.getContext('2d').drawImage(tmpimg, data.x, data.y, data.width, data.height, 0, 0, tmpimg.width, tmpimg.height);
			img.src = tmpcanvas.toDataURL();
			$('mdlImgEditor').modal('hide');
			document.getElementById("filename").innerHTML = file.name;
		}

		$("#mdlImgEditor").modal();
	}

	if (file && file.type.match('image.*')) {
		reader.readAsDataURL(file);
	} else {
		swal("Error", "Please select an image.", "error");
		document.getElementById("filename").innerHTML = "";
		img.src = "";
	}
}

frmAddProperty.elements["cmbPropertyIcon"].onchange = function() {
	var cmbPropertyIcon = frmAddProperty.elements["cmbPropertyIcon"];
	var icon = cmbPropertyIcon.options[cmbPropertyIcon.selectedIndex];

	if (icon.value === "custom") {
		var fcCustomIcon = document.getElementById("fcCustomIcon");

		fcCustomIcon.onchange = function() {
			var file = fcCustomIcon.files[0];
			var reader = new FileReader();

			reader.onloadend = function() {
				icon.value = reader.result;
				icon.setAttribute("data-image", reader.result);
				icon.text = file.name;
			}

			if (file && file.type.match('image.*')) {
				reader.readAsDataURL(file);
			} else {
				alert("Please select an image.");
				icon.value = "custom";
				$("select[name=cmbPropertyIcon]").msDropDown().data("dd").set("selectedIndex", 0);
			}
		}

		fcCustomIcon.click();
	}
}

var props = 0;
btnAddProperty.onclick = function() {
	var newRow = tblProperties.getElementsByTagName('tbody')[0].insertRow(-1);
	var deleteBtn = newRow.insertCell(0);
	var newIcon = newRow.insertCell(0);
	var newExtras = newRow.insertCell(0);
	var newValue = newRow.insertCell(0);
	var newName = newRow.insertCell(0);
	newName.innerHTML = frmAddProperty.elements["lblPropertyName"].value;
	newValue.innerHTML = frmAddProperty.elements["lblPropertyValue"].value;

	var str = "<div class=\"checkbox\"><label><input type=\"checkbox\" class=\"cbxIconBg\" ";
	if (frmAddProperty.elements["cbxIconBg"].checked)
		str += " checked";
	str += " disabled>Background</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" class=\"cbxInfoBtn\" ";
	if (frmAddProperty.elements["cbxInfoBtn"].checked)
		str += " checked";
	str += " disabled>Info</label></div>";

	newExtras.innerHTML = str;


/*	var iconBgDiv = document.createElement("div");
	iconBgDiv.className = "checkbox";
	var iconBgLbl = document.createElement("label");
	iconBgLbl.onchange = function() { generateCard(); }
	var iconBgCbx = document.createElement("input");
	iconBgCbx.type = "checkbox";
	iconBgCbx.className = "cbxIconBg";
	iconBgCbx.checked = frmAddProperty.elements["cbxIconBg"].checked;

	iconBgLbl.appendChild(iconBgCbx);
	iconBgLbl.innerHTML += "Background";
	iconBgDiv.appendChild(iconBgLbl);


	var infoBtnDiv = document.createElement("div");
	infoBtnDiv.className = "checkbox";
	var infoBtnLbl = document.createElement("label");
	infoBtnLbl.onchange = function() { generateCard(); }
	var infoBtnCbx = document.createElement("input");
	infoBtnCbx.type = "checkbox";
	infoBtnCbx.className = "cbxInfoBtn";
	infoBtnCbx.checked = frmAddProperty.elements["cbxInfoBtn"].checked;

	infoBtnLbl.appendChild(infoBtnCbx);
	infoBtnLbl.innerHTML += "Info";
	infoBtnDiv.appendChild(infoBtnLbl);
	newExtras.appendChild(iconBgDiv);
	newExtras.appendChild(infoBtnDiv);*/


	var selectedPropertyIcon = getSelectedPropertyIcon();
	newIcon.innerHTML = "<img class=\"tableicon\" src=\"" +
						selectedPropertyIcon.value +
						"\" alt=\"" +
						selectedPropertyIcon.text +
						"\"></img>";
	newRow.className = "prpRow";
	newRow.id = "prpRow" + props;

	var btnTd = document.createElement("td");
	var delBtn = document.createElement("button");
	delBtn.className = "sc-btn sc-btn-red sc-btn-table";
	delBtn.innerHTML = "<sup>x</sup>";
	delBtn.setAttribute("type", "button");
	delBtn.onclick = function() {
		document.getElementById(newRow.id).remove();
		generateCard();
	}
	btnTd.appendChild(delBtn);
	deleteBtn.appendChild(btnTd);
	
	$("#mdlAddProperty").modal("hide");
	generateCard();
	props++;
	frmAddProperty.reset();
	$("select[name=cmbPropertyIcon]").msDropDown().data("dd").set("selectedIndex", 0);
}

nbrDonationAmount.onkeyup = function() {
	document.getElementById("aDonate").href = "https://www.paypal.me/GiorgioGarasto/" + (Math.round(nbrDonationAmount.value * 100) / 100) + "usd";
}

var btnSaveSD = document.getElementById("btnSaveSD");
$(document.body).on('click', '#btnSaveSD', function() {
	var canvasSD = document.createElement("canvas");
	canvasSD.width = 510;
	canvasSD.height = 640;
	canvasSD.getContext('2d').drawImage(canvas, 0, 0, 510, 640);
	canvasSD.toBlob(function(blob) {
		saveAs(blob, "Level " + getSelectedLevel() + " " + lblName.value + "_SD.png");
	});
});

$(document.body).on('click', '#btnSaveHD', function() {
	var canvasHD = document.createElement("canvas");
	canvasHD.width = 1074;
	canvasHD.height = 1346;
	canvasHD.getContext('2d').drawImage(canvas, 0, 0, 1074, 1346);
	canvasHD.toBlob(function(blob) {
		saveAs(blob, "Level " + getSelectedLevel() + " " + lblName.value + "_HD.png");
	});
});

$(document.body).on('click', '#btnSaveFQ', function() {
	canvas.toBlob(function(blob) {
		saveAs(blob, "Level " + getSelectedLevel() + " " + lblName.value + "_FQ.png");
	});
});

document.getElementById("btnSave").onclick = function() {
	var properties = document.getElementsByClassName("prpRow");
	var prp = new Array();

	for (var i = properties.length - 1; i >= 0; i--) {
		var property = properties[i].getElementsByTagName("td");
		prp.unshift({
			name: property[0].innerHTML,
			value: property[1].innerHTML,
			extras: {
				background: property[2].getElementsByClassName("cbxIconBg")[0].checked,
				info: property[2].getElementsByClassName("cbxInfoBtn")[0].checked
			},
			icon: {
				value: property[3].firstChild.src,
				text: property[3].firstChild.alt
			}
		});
	}

	var data = {
		language: getSelectedLanguage(),
		name: lblName.value,
		rarity: getSelectedRarity().value,
		level: getSelectedLevel(),
		type: getSelectedType(),
		elixir: getSelectedElixirCost(),
		description: txtDescription.value,
		image: img.src,
		properties: prp
	}
	var blob = new Blob([JSON.stringify(data, undefined, 4)], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "Level " + getSelectedLevel() + " " + lblName.value + ".card");
}

fcCard.onchange = function() {
	var file = fcCard.files[0];
	var reader = new FileReader();

	reader.onloadend = function() {
		try {
			var data = JSON.parse(reader.result);

			cmbLanguage.querySelector("option[value='" + data.language + "']").selected = "selected";
			lblName.value = data.name;
			cmbRarity.querySelector("option[value='" + data.rarity + "']").selected = "selected";
			cmbLevel.querySelector("option[value='" + data.level + "']").selected = "selected";
			cmbType.querySelector("option[value='" + data.type + "']").selected = "selected";
			cmbElixirCost.querySelector("option[value='" + data.elixir + "']").selected = "selected";
			txtDescription.value = data.description;
			img.src = data.image;

			props = 0;

			var newTbody = document.createElement('tbody');
			data.properties.forEach(function(property) {
				var newRow = newTbody.insertRow(-1);
				var deleteBtn = newRow.insertCell(0);
				var newIcon = newRow.insertCell(0);
				var newExtras = newRow.insertCell(0);
				var newValue = newRow.insertCell(0);
				var newName = newRow.insertCell(0);

				newName.innerHTML = property.name;
				newValue.innerHTML = property.value;

				var str = "<div class=\"checkbox\"><label><input type=\"checkbox\" class=\"cbxIconBg\" ";
				if (property.extras.background)
					str += " checked";
				str += " disabled>Background</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" class=\"cbxInfoBtn\" ";
				if (property.extras.info)
					str += " checked";
				str += " disabled>Info</label></div>";

				newExtras.innerHTML = str;


				var selectedPropertyIcon = property.icon;
				newIcon.innerHTML = "<img class=\"tableicon\" src=\"" +
									selectedPropertyIcon.value +
									"\" alt=\"" +
									selectedPropertyIcon.text +
									"\"></img>";
				newRow.className = "prpRow";
				newRow.id = "prpRow" + props;

				var btnTd = document.createElement("td");
				var delBtn = document.createElement("button");
				delBtn.className = "sc-btn sc-btn-red sc-btn-table";
				delBtn.innerHTML = "<sup>x</sup>";
				delBtn.setAttribute("type", "button");
				delBtn.onclick = function() {
					document.getElementById(newRow.id).remove();
					generateCard();
				}
				btnTd.appendChild(delBtn);
				deleteBtn.appendChild(btnTd);
				props++;
			});
			tblProperties.replaceChild(newTbody, tblProperties.getElementsByTagName('tbody')[0]);

			generateCard();
			swal("Success!", "Your card '" + data.name + "' was imported successfully!", "success");
		} catch(e) {
			swal("Error", "Please select a valid .card file.", "error");
		}
	}

	if (file)
		reader.readAsText(file);
	else
		swal("Error", "There was an error importing your card.", "error");
	fcImage.value = null;
}

$(document).ready(function(e) {
	var userLang = (navigator.userLanguage || navigator.language || navigator.browserLanguage || navigator.systemLanguage).substr(0, 2);
	var includesWebsiteLang = false,
		includesCardLang = false;
	for (var locale in Locales) {
		if (Locales.hasOwnProperty(locale))
			if (locale === userLang) {
				if (Locales[locale].website)
					includesWebsiteLang = true;
				if (Locales[locale].card)
					includesCardLang = true;
			}
	}
	var websiteLang = "en",
		cardLang = "en";
	if (includesWebsiteLang)
		websiteLang = userLang;
	if (includesCardLang)
		cardLang = userLang;

	document.getElementById("cmbCountries").querySelector("option[value='" + websiteLang + "']").selected = "selected";
	setWebsiteTranslation(websiteLang);
	cmbLanguage.querySelector("option[value='" + cardLang + "']").selected = "selected";

/*	try {
		$("#cmbCountries").msDropDown();
	} catch(e) {
		console.log(e.message);
	}*/

	$("#mdlAddProperty").on('shown.bs.modal', function() {
		try {
			$("select[name=cmbPropertyIcon]").msDropDown();
			$("input[name=lblPropertyName]").focus();
		} catch(e) {
			console.log(e.message);
		}
	});
	$("#tblProperties > tbody").sortable({
		update: function() { generateCard(); }
	});
	$("#tblProperties > tbody").disableSelection();
})

var downloadShown = false;
$('#btnDownload').qtip({
	content: $("#btnDownloadTltp").html(),
	show: 'click',
	hide: 'click',
	events: {
		show: function(event, api) {
			downloadShown = true;
		},
		hide: function(event, api) {
			downloadShown = false;
		}
	},
	style: 'qtip-bootstrap',
	position: {
		my: 'bottom center',
		at: 'top center',
		adjust: {
			method: 'shift'
		}
	}
});
document.onclick = function() {
	if (downloadShown)
		$('#btnDownload').qtip('hide');
}

/*$('#btnUpload').qtip({
	content: function(event, api) {
		var img = canvas.toDataURL().split(',')[1];
		var keys = shuffle([
			'a502c7da924e84d', // Clash Royale Card Maker
			'20a1c89f9478278', // Clash Royale Card Maker  2
			'05977f819bce1c4', // Clash Royale Card Maker  3
			'136fb21e994ce4b', // Clash Royale Card Maker  4
			'e04d4ec50effa16', // Clash Royale Card Maker  5
			'97e79145f19a168', // Clash Royale Card Maker  6
			'd9fbf6a4f8c4a4b', // Clash Royale Card Maker  7
			'2d8226cb3d6f62c', // Clash Royale Card Maker  8
			'8c148f38cee9858', // Clash Royale Card Maker  9
			'a5dcd30159e0e5e', // Clash Royale Card Maker 10
			'0153a16c41b1332', // Clash Royale Card Maker 11
			'dbc19fdb1b4e16f', // Clash Royale Card Maker 12
			'0e912555c6e361c', // Clash Royale Card Maker 13
			'1cfe00c77470434', // Clash Royale Card Maker 14
			'd9b83bc7095ae1e', // Clash Royale Card Maker 15
			'9381a65aea3ad00', // Clash Royale Card Maker 16
			'28102ab995538e4', // Clash Royale Card Maker 17
			'48ec4af0d2b740d', // Clash Royale Card Maker 18
			'b0ca18063db5d96', // Clash Royale Card Maker 19
			'202fbab68dacc45', // Clash Royale Card Maker 20
			'4130bbbfbc6cb2d', // Clash Royale Card Maker 21
			'e12b0aaad734143', // Clash Royale Card Maker 22
			'8757dfa1a0b2e7a', // Clash Royale Card Maker 23
			'8661dcf1d042222', // Clash Royale Card Maker 24
			'a8ed859967abb66', // Clash Royale Card Maker 25
			'd93fd8981039dbf', // Clash Royale Card Maker 26
			'13e828f2af28cd0', // Clash Royale Card Maker 27
			'258594d43d03f8b', // Clash Royale Card Maker 28
			'9c691354f064539', // Clash Royale Card Maker 29
			'957963972d5ffe7'  // Clash Royale Card Maker 30
			// Would these be enough?!?!
		]);
		function request(index) {
			if (index >= keys.length)
				api.set('content.text', 'There was an error with your request.');
			else {
				$.ajax({
					url: 'https://api.imgur.com/3/upload.json',
					type: 'POST',
					headers: {
						Authorization: 'Client-ID ' + keys[index]
					},
					data: {
						type: 'base64',
						name: 'Level ' + getSelectedLevel() + ' ' + lblName.value + '.png',
						title: 'Level ' + getSelectedLevel() + ' ' + lblName.value,
						description: 'Made using http://clashroyalecardmaker.com/',
						image: img
					},
					dataType: 'json'
				}).then(function(data) {
					var link = 'http://i.imgur.com/' + data.data.id;
					var text = '<div class="form-group">\
									<p class="text-left"><small>Link to the post:</small></p>\
									<input type="text" class="form-control" value="' + link + '" readonly>\
								</div>\
								<div class="form-group">\
									<p class="text-left"><small>Direct link to the original image:</small></p>\
									<input type="text" class="form-control" value="' + link + '.png" readonly>\
								</div>\
								<div class="form-group">\
									<p class="text-left"><small>Direct link to the forum ready image:</small></p>\
									<input type="text" class="form-control" value="' + link + 'l.jpg" readonly>\
								</div>';
					api.set('content.text', text);
				}, function(xhr, status, error) {
					request(index + 1);
				});
			}
		}
		request(0);
		return 'Loading...';
	},
	show: 'click',
	hide: 'click',
	style: 'qtip-bootstrap',
	position: {
		my: 'bottom center',
		at: 'top center',
		adjust: {
			method: 'shift'
		}
	}
});
*/
function setWebsiteTranslation(lang) {
	for (var id in Locales[lang].website) {
		if (id.startsWith("ctl") || id.startsWith("btn"))
			document.getElementById(id).innerText = Locales[lang].website[id];
		if (id.startsWith("lbl") || id.startsWith("txt"))
			document.getElementById(id).placeholder = Locales[lang].website[id];
		if (id.startsWith("cmb")) {
			var opts = document.getElementById(id).getElementsByTagName("option");
			for (var i = opts.length - 1; i >= 0; i--)
				opts[i].innerText = Locales[lang].website[id][i];
		}
	}
/*	var rar = document.getElementById("cmbRarity").getElementsByTagName("option");
	for (var i = rar.length - 1; i >= 0; i--)
		rar[i].innerText = Locales[lang].website.cmbRarity[i];
	var typ = document.getElementById("cmbType").getElementsByTagName("option");
	for (var i = typ.length - 1; i >= 0; i--)
		typ[i].innerText = Locales[lang].website.cmbType[i];*/
	document.getElementById("cbxIconBgLbl").innerHTML = '<input type="checkbox" name="cbxIconBg" checked>' + Locales[lang].website.cbxIconBgLbl;
	document.getElementById("cbxInfoBtnLbl").innerHTML = '<input type="checkbox" name="cbxInfoBtn">' + Locales[lang].website.cbxInfoBtnLbl.replace('[i]', '<img src="img/info.png" alt="info" title="info" style="width: 20px;" />');
}
/*
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
*/