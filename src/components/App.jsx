//react
import { useEffect, useState } from "react";
//components
import Header from "./Header/Header.jsx";
import ScreenLoader from "./ScreenLoader/ScreenLoader.jsx";
import API from "../utils/api.js";
import Main from "./Main/Main.jsx";
import Footer from "./Footer/Footer.jsx";
//contexto
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  //funciones
  //popup
  const handleOpenPopUp = (popup) => {
    setPopup(popup);
  };

  const handleClosePopUp = () => {
    setPopup(null);
  };
  //Hooks
  //GET UserInfo - Cards
  useEffect(() => {
    setIsLoading(true);
    Promise.all([API.getUserInfo(), API.getCards()])
      .then(([userData, cardsData]) => {
        setCurrentUser(userData);
        setCards(cardsData);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);

  //Funciones API
  //User
  //UPDATE UserInfo
  const handleUpdateUser = (data) => {
    (async () => {
      await API.updateUserInfo(data)
        .then((newData) => {
          setCurrentUser(newData);
          handleClosePopUp();
        })
        .catch((error) => console.error(error));
    })();
  };
  //UPDATE avatar
  const handleUpdateAvatar = (data) => {
    (async () => {
      await API.updateUserAvatar(data)
        .then((newData) => {
          setCurrentUser(newData);
          handleClosePopUp();
        })
        .catch((error) => console.error(error));
    })();
  };
  //Cards
  //POST Card
  async function handlePostCard(card) {
    try {
      const NewCard = await API.postCard(card);
      setCards([NewCard, ...cards]);
      handleClosePopUp();
    } catch (error) {
      console.log("Fallo algo al agregar carta: ", error);
    }
  }

  //UPDATE Like Card
  async function handleCardLike(card) {
    //Revisa si hay like o no
    const isLiked = card.isLiked;

    try {
      //La clase usa la API y esta devuelve la nueva carta actualizada
      const UpdatedCard = await API.cardToggleLike(card._id, !isLiked);

      //Devuelvo un nuevo arreglo, reemplazando una carta
      setCards((cards) =>
        cards.map((currentCard) =>
          currentCard._id === UpdatedCard._id ? UpdatedCard : currentCard,
        ),
      );
    } catch (error) {
      console.error("Error al cambiar el like:", error);
    }
  }
  //DELETE card
  async function handleCardDelete(card) {
    try {
      //borro la carta de la API
      await API.cardDelete(card._id);
      //Devuelvo un nuevo arreglo, tirando la vieja carta
      setCards(
        (cards) => cards.filter((currentCard) => currentCard._id != card._id),
        handleClosePopUp(),
      );
    } catch (error) {
      console.error("Error al cambiar eliminar :", error);
    }
  }

  return (
    <>
      <div className="page__content">
        <Header />
        {isLoading && <ScreenLoader />}
        <CurrentUserContext.Provider
          value={{
            currentUser,
            handleUpdateUser,
            handleUpdateAvatar,
          }}
        >
          <Main
            handleOpenPopUp={handleOpenPopUp}
            handleClosePopUp={handleClosePopUp}
            popup={popup}
            cards={cards}
            handleCardLike={handleCardLike}
            handleCardDelete={handleCardDelete}
            //dado que este solo tiene un nivel para pasar la funcion
            handlePostCard={handlePostCard}
          />
        </CurrentUserContext.Provider>

        <Footer />
      </div>
    </>
  );
}

export default App;
