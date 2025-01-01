import React, { useState, useEffect } from "react";
import { getAutoConsultationByYear } from "./AutoConsultationAPI";
import AutoConsultationContainer from "./AutoConsultationContainer";
import "./AutoConsultation.css";
import AnimalCategory from "../../models/AnimalCategory";
import ShelterCategory from "../../models/ShelterCategory";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { getToken } from "../../service/localStorageService";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import api from "../../axious/axious";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import noImage from "../../img/pngtree-no-image-available-icon-flatvector-illustration-pic-design-profile-vector-png-image_40966566.jpg";

interface Post {
  id: number;
  postCategory: { postCategoryName: string };
  title: string;
  images: { id: number; imageUrl: string }[];
  content: string;
  destiny: { destiny: string };
  likeNumber: number;
  dislikeNumber: number;
  createdBy: string;
  createdDate: string;
  comments: {
    id: number;
    content: string;
    createdBy: string;
    createdDate: string;
  }[];
}

interface ArrowButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const AutoConsultationComponent: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | string>("");
  const [consultationData, setConsultationData] =
    useState<AutoConsultationContainer | null>(null);
  const [error, setError] = useState<string>("");
  const years = [];
  const [isAnimalModalVisible, setAnimalModalVisible] = useState(false);
  const [isShelterModalVisible, setShelterModalVisible] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalCategory | null>(
    null
  );
  const [selectedShelter, setSelectedShelter] =
    useState<ShelterCategory | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // State to track current slide index
  const totalImages = selectedAnimal?.animalImages?.length ?? 0; // Safely get the number of images
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(2);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPostsByYear = async () => {
    const token = getToken();
    const parsedYear = Number(year);
    try {
      const response = await api.get(
        `/posts/search-posts/year?year=${parsedYear}&page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data.result;
      setPosts(result.data);
      setTotalPages(Math.floor(result.totalPages / 2));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPostsByYear();
  }, [year, page, size]);

  const navigate = useNavigate();
  const handleConsultationClick = () => {
    navigate("/consultation-request");
  };
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const showAnimalModal = (animal: AnimalCategory) => {
    setSelectedAnimal(animal);
    setAnimalModalVisible(true);
  };

  const showShelterModal = (shelter: ShelterCategory) => {
    setSelectedShelter(shelter);
    setShelterModalVisible(true);
  };

  const handleAnimalModalClose = () => setAnimalModalVisible(false);
  const handleShelterModalClose = () => setShelterModalVisible(false);

  for (let i = 1930; i <= currentYear; i++) {
    years.push(i);
  }

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(Number(event.target.value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setConsultationData(null);
    const parsedYear = Number(year);
    if (year === "" || isNaN(parsedYear)) {
      setError("Invalid year. Please select a valid year.");
      return;
    }
    const result = await getAutoConsultationByYear(parsedYear);
    if (result) {
      setConsultationData(result.result);
    } else {
      setError("Failed to fetch data. Please try again.");
    }
  };

  const NextArrow: React.FC<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }> = ({ onClick, disabled }) => (
    <button
      className="ac-infor-next-arrow"
      onClick={onClick}
      hidden={disabled} // Add disabled attribute to button
    >
      <FaArrowRight />
    </button>
  );

  const PrevArrow: React.FC<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }> = ({ onClick, disabled }) => (
    <button
      className="ac-infor-prev-arrow"
      onClick={onClick}
      hidden={disabled} // Add disabled attribute to button
    >
      <FaArrowLeft />
    </button>
  );

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current: number, next: number) => {
      setCurrentIndex(next); // Update index before change
    },
    nextArrow: (
      <NextArrow
        disabled={currentIndex === totalImages - 1 || totalImages === 1}
      />
    ), // Disable when at last image or only one image
    prevArrow: <PrevArrow disabled={currentIndex === 0 || totalImages === 1} />, // Disable when at first image or only one image
  };

  return (
    <div className="autoConsultation-container">
      <form className="AutoConsultationForm" onSubmit={handleSubmit}>
        <div>
          <h1 className="titleDestiny">Five Element Destiny Consultation</h1>
          <select id="year" value={year} onChange={handleYearChange}>
            <option>-- Select a Year --</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button className="autoConsultation" type="submit">
          CHECK
        </button>
      </form>
      {error && (
        <>
          <div className="ac-error-overlay" onClick={() => setError("")}></div>
          <div className="ac-error-popup">
            <div className="ac-error-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                color="#f44336"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#f44336"
                  strokeWidth="2"
                  fill="none"
                ></circle>
                <line
                  x1="15"
                  y1="9"
                  x2="9"
                  y2="15"
                  stroke="#f44336"
                  strokeWidth="2"
                ></line>
                <line
                  x1="9"
                  y1="9"
                  x2="15"
                  y2="15"
                  stroke="#f44336"
                  strokeWidth="2"
                ></line>
              </svg>
            </div>
            <p className="ac-error-text">{error}</p>
            <button className="ac-error-button" onClick={() => setError("")}>
              OK
            </button>
          </div>
        </>
      )}{" "}
      {consultationData && (
        <div id={consultationData.destiny} className="consultation-results">
          <h2 id={consultationData.destiny} className="titleDestiny2">
            Your Element Destiny is {consultationData.destiny}
          </h2>
          <div id="wood" className={consultationData.destiny}>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
          <div id="fire" className={consultationData.destiny}>
            <div id={consultationData.destiny} className="red flame"></div>
            <div id={consultationData.destiny} className="orange flame"></div>
            <div id={consultationData.destiny} className="yellow flame"></div>
            <div id={consultationData.destiny} className="white flame"></div>
            <div id={consultationData.destiny} className="blue circle"></div>
            <div id={consultationData.destiny} className="black circle"></div>
          </div>
          <div id="water" className={consultationData.destiny}>
            <div id={consultationData.destiny} className="wave_1 outer-shadow">
              <div
                id={consultationData.destiny}
                className="inner-shadow align-center"
              ></div>
            </div>
            <div
              id={consultationData.destiny}
              className="wave_2 outer-shadow align-center"
            >
              <div
                id={consultationData.destiny}
                className="inner-shadow align-center"
              ></div>
            </div>
            <div
              id={consultationData.destiny}
              className="wave_3 outer-shadow align-center"
            >
              <div
                id={consultationData.destiny}
                className="inner-shadow align-center"
              ></div>
            </div>
            <div
              id={consultationData.destiny}
              className="drop align-center"
            ></div>
          </div>
          <div id={consultationData.destiny} className="spaceForRock">
            <div id="earth" className={consultationData.destiny}></div>
          </div>
          <div id="shield" className={consultationData.destiny}>
            <div id={consultationData.destiny} className="shield__inner"></div>
          </div>
          <div className="ac-text">
            <h3 id={consultationData.destiny} className="titleDestiny2">
              1. Number of Fish
            </h3>
            <p>
              For those with the {consultationData.destiny} destiny, having the
              right number of fish not only supports fortune but also activates
              feng shui, attracting wealth and creating harmony in life.
            </p>
            <p>
              Lucky numbers belonging to the {consultationData.destiny} element,
              such as {consultationData.consultation2.numbers.join(", ")}, will
              contribute to the stability and enhancement of your destiny
              energy. This brings sustainability and favor, helping you achieve
              harmony and growth.
            </p>
            <p>
              Meanwhile, numbers representing the{" "}
              {consultationData.destinyTuongSinh} element, such as{" "}
              {consultationData.consultation1.numbers.join(", ")}, possess
              mutual generation power, supporting the {consultationData.destiny}{" "}
              destiny. Choosing the number of fish according to these numbers
              will bring prosperity, increase fortune, and expand opportunities
              for success in your career.
            </p>
            <p>
              For 11 or more koi fish, disregard the tens digit and use the
              units digit. For example: 11, 15, 38, 40, 49 fish... count as 1,
              5, 8, 4, 9 fish. Then refer to the table above for calculation.
            </p>
          </div>
          <div className="ac-text">
            <h3 id={consultationData.destiny} className="titleDestiny2">
              2. Colors and Fish Types
            </h3>
            <p>
              Fish types and colors that are mutually generating and compatible
              with the {consultationData.destiny} destiny:
            </p>
            <ul>
              <li>
                Fish with colors{" "}
                {consultationData.consultation2.colors.join(", ")}: These colors
                belong to the {consultationData.destiny} element, enhancing
                stability and peace.
              </li>
              <p>
                Suitable fish types:
                {consultationData.consultation2.animals.map(
                  (animal: AnimalCategory, index: number) => (
                    <React.Fragment key={animal.id}>
                      {" "}
                      <button
                        id={consultationData.destiny}
                        className="autoConsultation-view"
                        onClick={() => showAnimalModal(animal)}
                      >
                        {animal.animalCategoryName}
                      </button>
                      {index <
                        consultationData.consultation2.animals.length - 1 &&
                        ", "}
                    </React.Fragment>
                  )
                )}
              </p>
              <li>
                Fish with colors{" "}
                {consultationData.consultation1.colors.join(", ")}: These colors
                belong to the {consultationData.destinyTuongSinh} element, as{" "}
                {consultationData.destinyTuongSinh} generates{" "}
                {consultationData.destiny}, offering support and growth to those
                with the {consultationData.destiny} destiny.
              </li>
              <p>
                Suitable fish types:
                {consultationData.consultation1.animals.map(
                  (animal: AnimalCategory, index: number) => (
                    <React.Fragment key={animal.id}>
                      {" "}
                      <button
                        id={consultationData.destiny}
                        className="autoConsultation-view"
                        onClick={() => showAnimalModal(animal)}
                      >
                        {animal.animalCategoryName}
                      </button>
                      {index <
                        consultationData.consultation1.animals.length - 1 &&
                        ", "}
                    </React.Fragment>
                  )
                )}
              </p>
            </ul>
          </div>
          <div className="ac-text">
            <h3 id={consultationData.destiny} className="titleDestiny2">
              3. Pond Direction
            </h3>
            <p>
              The pond direction for those with the {consultationData.destiny}{" "}
              destiny should be placed in directions belonging to the{" "}
              {consultationData.destiny} element or the{" "}
              {consultationData.destinyTuongSinh} element:
            </p>
            <ul>
              <li>
                Directions{" "}
                {consultationData.consultation2.directions.join(", ")}:
                Belonging to the {consultationData.destiny} element, very
                beneficial for advancement and wealth.
              </li>
              <li>
                Directions{" "}
                {consultationData.consultation1.directions.join(", ")}: These
                support and enhance the fortune of the{" "}
                {consultationData.destiny} destiny.
              </li>
            </ul>
          </div>
          <div className="ac-text">
            <h3 id={consultationData.destiny} className="titleDestiny2">
              4. Pond Shape
            </h3>
            <ul>
              <li>
                Shape {consultationData.consultation2.shapes.join(", ")}, as
                these shapes represent the Water element, fostering harmony and
                energy flow.
              </li>
              <p>
                Collected pond models:
                {consultationData.consultation2.shelters.map(
                  (shelter: ShelterCategory, index: number) => (
                    <React.Fragment key={shelter.id}>
                      {" "}
                      <button
                        id={consultationData.destiny}
                        className="autoConsultation-view"
                        onClick={() => showShelterModal(shelter)}
                      >
                        {shelter.shelterCategoryName}
                      </button>
                      {index <
                        consultationData.consultation2.shelters.length - 1 &&
                        ", "}
                    </React.Fragment>
                  )
                )}
              </p>
              <li>
                Shapes belonging to the {consultationData.destinyTuongSinh}{" "}
                element, like shape{" "}
                {consultationData.consultation1.shapes.join(", ")}, are also
                suitable, as {consultationData.destinyTuongSinh} generates{" "}
                {consultationData.destiny}, creating strong compatibility and
                bringing prosperity and support to the homeowner's fortune.
              </li>
              <p>
                Collected pond models:
                {consultationData.consultation1.shelters.map(
                  (shelter: ShelterCategory, index: number) => (
                    <React.Fragment key={shelter.id}>
                      {" "}
                      <button
                        id={consultationData.destiny}
                        className="autoConsultation-view"
                        onClick={() => showShelterModal(shelter)}
                      >
                        {shelter.shelterCategoryName}
                      </button>
                      {index <
                        consultationData.consultation1.shelters.length - 1 &&
                        ", "}
                    </React.Fragment>
                  )
                )}
              </p>
            </ul>
          </div>
          <div>
            {posts && posts.length > 0 && (
              <h2 id={consultationData.destiny} className="titleDestiny2">
                Blog related to your destiny
              </h2>
            )}
          </div>
          <div className="container ac-posts-container">
            {/* Conditionally render the left arrow button only if there are posts */}
            {posts && posts.length > 0 && page > 1 && (
              <button
                className="ac-arrow ac-arrow-left"
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                <FaArrowLeft />
              </button>
            )}

            <div className="row ac-post">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="col-md-3 ac-post-card">
                    <Link to={`/posts/${post.id}`} className="post-link">
                      <img
                        className="ac-post-card-image"
                        src={
                          post.images && post.images[0]
                            ? post.images[0].imageUrl
                            : noImage
                        }
                        alt={post.title}
                      />
                      <h3 className="ac-post-card-title">{post.title}</h3>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="notify-login-blog">*Login to view blog.</p>
              )}
            </div>

            {/* Conditionally render the right arrow button only if there are posts */}
            {posts && posts.length > 0 && (
              <button
                className="ac-arrow ac-arrow-right"
                onClick={handleNextPage}
                hidden={page === totalPages}
              >
                <FaArrowRight />
              </button>
            )}
          </div>

          {selectedAnimal && (
            <div
              className="ac-popup-overlay"
              onClick={() => setSelectedAnimal(null)}
            >
              <div
                className="ac-popup-content row"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="autoConsul-image col-6">
                  {selectedAnimal.animalImages?.length ? (
                    <Slider {...settings}>
                      {selectedAnimal.animalImages.map((img, index) => (
                        <div className="autoConsul-popup-class" key={index}>
                          <img
                            src={img.imageUrl}
                            alt={`${selectedAnimal.animalCategoryName} image ${
                              index + 1
                            }`}
                          />
                        </div>
                      ))}
                    </Slider>
                  ) : (
                    <img src={noImage} alt="No images available" />
                  )}
                </div>

                <div
                  id={consultationData.destiny}
                  className="ac-fish-infor col-6"
                >
                  <h3>{selectedAnimal.animalCategoryName}</h3>
                  <p>Description: {selectedAnimal.description}</p>
                  <p>Origin: {selectedAnimal.origin}</p>
                </div>
              </div>
            </div>
          )}

          {selectedShelter && (
            <div
              className="ac-popup-overlay"
              onClick={() => setSelectedShelter(null)}
            >
              <div
                className="ac-popup-content row"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="autoConsul-image col-6">
                  {selectedShelter.shelterImages?.length ? (
                    <Slider {...settings}>
                      {selectedShelter.shelterImages.map((img, index) => (
                        <div className="autoConsul-popup-class" key={index}>
                          <img
                            src={img.imageUrl}
                            alt={`${
                              selectedShelter.shelterCategoryName
                            } image ${index + 1}`}
                          />
                        </div>
                      ))}
                    </Slider>
                  ) : (
                    <img src={noImage} alt="No images available" />
                  )}
                </div>

                <div className="ac-fish-infor col-6">
                  <h3>{selectedShelter.shelterCategoryName}</h3>
                  <p>Description: {selectedShelter.description}</p>
                  <p>
                    Dimensions: {selectedShelter.width} x{" "}
                    {selectedShelter.height} x {selectedShelter.length}
                  </p>
                  <p>Diameter: {selectedShelter.diameter}</p>
                  <p>Water Volume: {selectedShelter.waterVolume} liters</p>
                  <p>
                    Filtration System: {selectedShelter.waterFiltrationSystem}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleConsultationClick}
            className="btnSeeMore"
            style={{ marginLeft: "40%" }}
          >
            Consultation from Experts
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoConsultationComponent;
