import styled from "styled-components";
import { Button } from "components/Atomic";
import { TailSpin } from "react-loader-spinner";
import { useZakeke } from "@zakeke/zakeke-configurator-react";
import useStore from "Store";
import { useRef } from "react";

const TopBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #d1c5b3;
   @media (max-width: 1024px) {
    border-bottom: none;
    padding:10px 10px;  
  }
`;

const PriceBox = styled.div`
//   border: 1.5px solid #A0805A;
//   border-radius: 9999px;
  padding: 7px 24px;
  font-size: 18px;
  font-weight: 600;
  color: #000;
//   background-color: #fff;
`;

const AddToCartButton = styled(Button)`
  background-color: #A0805A;
  border-radius: 9999px;
  color: #fff;
  font-weight: 500;
  min-width: 160px;
  height: 40px;
  border: none;
  &:hover {
    background-color: #8a6c4c;
  }
`;

const TopBar = () => {
    const addToCartButtonRef = useRef<HTMLButtonElement>(null);

    const {
        addToCart,
        isAddToCartLoading,
        price,
        isOutOfStock,
        useLegacyScreenshot,
    } = useZakeke();

    const { priceFormatter } = useStore();

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart([], undefined, useLegacyScreenshot);
    };

    return (
        <TopBarContainer>
            {/* Price */}
            <div className="">
                {price !== null && price > 0 && (
                    <PriceBox>{priceFormatter.format(price)}</PriceBox>
                )}
            </div>

            {/* Add to Cart */}
            <AddToCartButton
                ref={addToCartButtonRef}
                onClick={handleAddToCart}
                disabled={isAddToCartLoading || isOutOfStock}
            >
                {isAddToCartLoading ? (
                    <TailSpin color="#FFFFFF" height="25px" />
                ) : isOutOfStock ? (
                    "OUT OF STOCK"
                ) : (
                    "Add to Cart"
                )}
            </AddToCartButton>
        </TopBarContainer>
    );
};

export default TopBar;
