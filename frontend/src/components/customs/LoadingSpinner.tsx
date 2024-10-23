import { ClipLoader } from 'react-spinners';

const LoadingSpinner = () => {
  return (
    <div style={styles.loaderContainer}>
      <ClipLoader color="#800080" size={50} />
    </div>
  );
};

const styles = {
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Full viewport height (adjust if needed)
    width: '100vw',  // Full viewport width (adjust if needed)
  },
};

export default LoadingSpinner;
