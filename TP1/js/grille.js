/* Classe principale du jeu, c'est une grille de cookies. Le jeu se joue comme
Candy Crush Saga etc... c'est un match-3 game... */
class Grille {
  tabCookiesCliquees = [];
  nbCookiesDifferents = 6;

  constructor(l, c) {
    this.nbLignes = l;
    this.nbColonnes = c;
    this.remplirTableauDeCookies();
  }

  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      let ligne = Math.floor(index / this.nbColonnes);
      let colonne = index % this.nbColonnes;

    
      let img = this.tabCookies[ligne][colonne].htmlImage;

      img.onclick = (evt) => {
        let imgClickee = evt.target;
        let l = imgClickee.dataset.ligne;
        let c = imgClickee.dataset.colonne;
        let cookieCliquee = this.tabCookies[l][c];
        cookieCliquee.selectionnee();

        if (this.tabCookiesCliquees.length === 0) {
          this.tabCookiesCliquees.push(cookieCliquee);
        } else if (this.tabCookiesCliquees.length === 1) {
          this.tabCookiesCliquees.push(cookieCliquee);

          if (this.swapPossible()) {
            console.log("swap");
            this.swapCookies();
          } else {
            console.log("Le SWAP n'est pas possible");
          }
          this.tabCookiesCliquees[0].deselectionnee();
          this.tabCookiesCliquees[1].deselectionnee();
          this.tabCookiesCliquees = [];
        }
      };

      img.ondragstart = (evt) => {
        console.log("dragstart");
        let imgClickee = evt.target;
        let l = imgClickee.dataset.ligne;
        let c = imgClickee.dataset.colonne;
        let cookieDragguee = this.tabCookies[l][c];

        this.tabCookiesCliquees = [];
        this.tabCookiesCliquees.push(cookieDragguee);
        cookieDragguee.selectionnee();

      };

      img.ondragover = (evt) => {
        return false;
      };

      img.ondragenter = (evt) => {
        console.log("ondragenter");
        let img = evt.target;
        img.classList.add("grilleDragOver");
      };

      img.ondragleave = (evt) => {
        console.log("ondragleave");
        let img = evt.target;
        img.classList.remove("grilleDragOver");
      };

      img.ondrop = (evt) => {
        console.log("ondrop");
        let imgDrop = evt.target;
        let l = imgDrop.dataset.ligne;
        let c = imgDrop.dataset.colonne;
        let cookieSurZoneDeDrop = this.tabCookies[l][c];

        this.tabCookiesCliquees.push(cookieSurZoneDeDrop);

        if (this.swapPossible()) {
          console.log("swap");
          this.swapCookies();
        } else {
          console.log("Le SWAP n'est pas possible");
        }
        this.tabCookiesCliquees[0].deselectionnee();
        this.tabCookiesCliquees[1].deselectionnee();
        imgDrop.classList.remove("grilleDragOver");

        this.tabCookiesCliquees = [];
      };
      div.append(img);
    });
  }
  swapPossible() {
    let cookie1 = this.tabCookiesCliquees[0];
    let cookie2 = this.tabCookiesCliquees[1];


    return Cookie.distance(cookie1, cookie2) === 1;
  }

  swapCookies() {
    let cookie1 = this.tabCookiesCliquees[0];
    let cookie2 = this.tabCookiesCliquees[1];

    let tmpType = cookie1.type;
    let tmpImgSrc = cookie1.htmlImage.src;

    cookie1.type = cookie2.type;
    cookie1.htmlImage.src = cookie2.htmlImage.src;

    cookie2.type = tmpType;
    cookie2.htmlImage.src = tmpImgSrc;

   
    this.detecteTousLesAlignements();
  }
  /**
   * Initialisation du niveau de départ. Le paramètre est le nombre de cookies différents
   * dans la grille. 4 types (4 couleurs) = facile de trouver des possibilités de faire
   * des groupes de 3. 5 = niveau moyen, 6 = niveau difficile
   *
   * Améliorations : 1) s'assurer que dans la grille générée il n'y a pas déjà de groupes
   * de trois. 2) S'assurer qu'il y a au moins 1 possibilité de faire un groupe de 3 sinon
   * on a perdu d'entrée. 3) réfléchir à des stratégies pour générer des niveaux plus ou moins
   * difficiles.
   *
   * On verra plus tard pour les améliorations...
   */
  remplirTableauDeCookies() {
  
    this.tabCookies = create2DArray(9);

    do {
      console.log(" GENERE UNE GRILLE SANS ALIGNEMENTS");
     
      for (let l = 0; l < this.nbLignes; l++) {
        for (let c = 0; c < this.nbColonnes; c++) {
          let type = Math.floor(Math.random() * this.nbCookiesDifferents);
          this.tabCookies[l][c] = new Cookie(type, l, c);
        }
      }
    } while (this.detecteTousLesAlignements());

    console.log("GRILLE SANS ALIGNEMENTS GENEREE");
  }

  detecteTousLesAlignements() {
    this.nbAlignements = 0;

    for (let l = 0; l < this.nbLignes; l++) {
      this.detecteAlignementLigne(l);
    }

    for (let c = 0; c < this.nbColonnes; c++) {
      this.detecteAlignementColonne(c);
    }

    return this.nbAlignements !== 0;
  }

  detecteAlignementLigne(ligne) {
    
    let ligneGrille = this.tabCookies[ligne];

   
    for (let l = 0; l <= this.nbColonnes - 3; l++) {
      let cookie1 = ligneGrille[l];
      let cookie2 = ligneGrille[l + 1];
      let cookie3 = ligneGrille[l + 2];

      if (cookie1.type === cookie2.type && cookie1.type === cookie3.type) {
        cookie1.supprimer();
        cookie2.supprimer();
        cookie3.supprimer();
        this.nbAlignements++;
      }
    }
  }

  detecteAlignementColonne(colonne) {
    for (let ligne = 0; ligne <= this.nbLignes - 3; ligne++) {
      let cookie1 = this.tabCookies[ligne][colonne];
      let cookie2 = this.tabCookies[ligne + 1][colonne];
      let cookie3 = this.tabCookies[ligne + 2][colonne];

      if (cookie1.type === cookie2.type && cookie1.type === cookie3.type) {
        cookie1.supprimer();
        cookie2.supprimer();
        cookie3.supprimer();

        this.nbAlignements++;
      }
    }
  }
}
