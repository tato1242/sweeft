import axios from "axios";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import Modal from "../modal/Modal";
import "./Fetch.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import useHistory from "../../hooks/useHistory";
import useCache from "../../hooks/useCache";

interface Photo {
  id: string;
  urls: {
    small: string;
  };
  alt_description?: string;
  description?: string;
  likes?: number;
  downloads?: number;
  views?: number;
}

const baseURL = "https://api.unsplash.com";
const accessKey = "V0QPvs3Zwr0WGF1qhNDnUkhViKYVKGp6Z9_1sfHnA10";

const Fetch = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setHistory } = useHistory() as { setHistory: (update: (prevHistory: string[]) => string[]) => void };
  const cache = useCache();

  const handleGetPopular = async () => {
    if (cache['popular']) {
      setPhotos(cache['popular']);
      return;
    }

    try {
      const response = await axios.get<Photo[]>(`${baseURL}/photos?order_by=popular&per_page=20&page=1&client_id=${accessKey}`);
      cache['popular'] = response.data;
      setPhotos(response.data);
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if( urlSearchQuery){
      setSearchTerm(urlSearchQuery)
    }
    else{
      handleGetPopular();
    }
  },[]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 10 &&
        !isLoading
      ) {
        if (searchTerm !== '') {
          fetchSearchedImages(searchTerm, page);
        } else {
          fetchImages(page);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading, page, searchTerm]);

  const fetchImages = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get<Photo[]>(`${baseURL}/photos?order_by=popular&per_page=20&page=${pageNum}&client_id=${accessKey}`);
      setPhotos((prevPhotos) => [...prevPhotos, ...response.data]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchedImages = async (term: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ results: Photo[] }>(`${baseURL}/search/photos?page=${pageNum}&query=${term}&client_id=${accessKey}`);
      const data = response.data;
      setPhotos((prevPhotos) => [...prevPhotos, ...data.results]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    if (term === '') {
      handleGetPopular();
      return;
    }

    setPhotos([]);

    if (cache[term]) {
      setPhotos(cache[term]);
      return;
    }

    setHistory((prevHistory) => {
      const newHistorySet = new Set([...prevHistory, term]);
      const newHistory = Array.from(newHistorySet); 
      console.log(newHistory);
      return newHistory;
    });

    try {
      const response = await axios.get<{ results: Photo[] }>(`${baseURL}/search/photos?page=1&query=${term}&client_id=${accessKey}`);
      const data = response.data;

      cache[term] = data.results;

      setPhotos(data.results);
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timerId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedFetchTags = useCallback(debounce((term: string) => handleSearch(term), 500), []);

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value || '');
    setSearchParams(new URLSearchParams({ search: value }));
  };

  useEffect(() => {
    if (searchTerm !== null) {
      debouncedFetchTags(searchTerm);
    }
  }, [searchTerm, debouncedFetchTags]);

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleImageClick = async (photo: Photo) => {
    try {
      const response = await axios.get<Photo>(`${baseURL}/photos/${photo.id}?client_id=${accessKey}`);
      setSelectedPhoto(response.data);
    } catch (error) {
      console.error("Error fetching photo:", error);
    }
  };

  const handleNavigateHistory = () => {
    navigate("/search-history")
  };

  return (
    <>
      <div className="search-container">
        <input type="text" value={searchTerm} onChange={handleChangeInput} placeholder="Search" />
        <button onClick={handleNavigateHistory}>History</button>
      </div>
      <div className="content-container">
  {photos.map((photo, index) => (
    <div className="image-container" key={`${photo.id}_${index}`}>
      <img src={photo.urls.small} alt={photo.alt_description || "No description"} onClick={() => handleImageClick(photo)} />
    </div>
  ))}
</div>


      {selectedPhoto && (
        <Modal isOpen={!!selectedPhoto} onClose={handleCloseModal}>
          <img src={selectedPhoto.urls.small} alt={selectedPhoto.alt_description || "No description"} />
          <p>Likes: {selectedPhoto.likes}</p>
          <p>Downloads: {selectedPhoto.downloads}</p>
          <p>Views: {selectedPhoto.views}</p>
        </Modal>
     

      )}
    </>
  );
};

export default Fetch;
