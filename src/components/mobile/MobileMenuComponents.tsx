// Import necessary dependencies
import { Icon } from 'components/Atomic';
import Tooltip from 'components/widgets/tooltip';
import React, { FC, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { ReactComponent as ArrowLeftIcon } from '../../assets/icons/arrow-left-solid.svg';
import { ReactComponent as ArrowRightIcon } from '../../assets/icons/arrow-right-solid.svg';
import noImage from '../../assets/images/no_image.png';

// Styled component for the container of each mobile menu item
export const MobileItemContainer = styled.div<{ selected?: boolean }>`
	align-items: center;
	justify-content: center;
	flex: 1;
	display: flex;
	flex-direction: row;
	gap: 8px;
	position: relative;
	padding: 8px;
	cursor: pointer;
	z-index:1000;
`;

// Inner card wrapper for the menu item
export const MenuItemCard = styled.div<{ selected?: boolean }>`
	width: 48px;
	height: 48px;
	min-width: 48px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 3px solid ${(props) => (props.selected ? '#CDA26E' : 'transparent')};
	border-radius: 2px;
	padding: 1px 1px;
	background-color: #ffffff;
	transition: all 0.2s ease;
	position: relative;
`;

// Styled component for the image of each menu item
export const MenuItemImage = styled.img<{ isRound?: boolean; selected?: boolean }>`
	width:100%;
	height: 100%;
	object-fit: cover;
	border-radius: ${(props) => (props.isRound ? '50%' : '2px')};
`;

// Styled component for the wrapper of multiple images in a menu item
export const MenuItemImagesWrapper = styled.div<{ selected?: boolean }>`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 2px;
	margin-bottom: 8px;
`;

// Styled component for each image wrapper in the menu item
export const MenuItemImagesImageWrapper = styled.div`
	width: 24px;
	height: 24px;
	overflow: hidden;
	border-radius: 4px;
`;

// Styled component for the label of each menu item
export const MenuItemLabel = styled.span<{ selected?: boolean }>`
	font-size: 14px;
	font-weight: 700;
	text-align: left;
	text-overflow: ellipsis;
	color: ${(props) => (props.selected ? '#121715' : '#000000B2')};
`;

// Styled component for each image in the menu item
export const MenuItemImagesImage = styled.img<{ isRound?: boolean; selected?: boolean }>`
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: ${(props) => (props.isRound ? '50%' : '4px')};
	filter: ${(props) => (props.selected ? 'brightness(0) invert(1)' : 'none')};
`;

// Styled component for the icon of each menu item
export const MenuItemIcon = styled.div<{ selected?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32px;
	margin-bottom: 8px;
	width: 48px;
	height: 48px;
	color: ${(props) => (props.selected ? '#ffffff' : '#A0805A')};
`;

// Function to determine the visibility of left and right arrows based on scroll position
const getVisibleArrows = (div: HTMLDivElement) => {
	let showLeft = false;
	let showRight = false;

	if (div.scrollLeft > 0) showLeft = true;

	if (div.scrollWidth - div.clientWidth > div.scrollLeft) showRight = true;

	return [showLeft, showRight];
};

// Props for the container of menu items
interface MenuItemsContainerProps {
	isLeftArrowVisible: boolean;
	isRightArrowVisible: boolean;
	onScrollChange: (value: number) => void;
	scrollLeft: number;
	children?: React.ReactNode;
}

// Props for each menu item
interface MenuItemProps {
	selected?: boolean;
	imageUrl?: string | null;
	icon?: React.ReactNode | string | null | undefined;
	label: string;
	onClick: () => void;
	className?: string;
	images?: string[];
	hideLabel?: boolean;
	description?: string | null;
	isRound?: boolean;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}

// Styled component for the wrapper of menu items
const MenuItemsWrapper = styled.div`
	display: flex;
	justify-content: space-evenly;
	align-items: center;
	max-width: 100%;
	min-height: 52px;
	width: 100%;
	// overflow-x: auto;
	background-color: #fff;
	// border-top: 1px #e0e0e0 solid;
	// padding: 8px 0;
	z-index:20;
	position:static;
	bottom:0;
	// border-top-left-radius: 12px;
	// border-top-right-radius: 12px;
	// box-shadow: 0px 0px 4px 0px #A0805A;
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */

	::-webkit-scrollbar {
		display: none;
	}

	// span {
	// 	font-size: 16px;
	// }
`;

// Styled component for the left arrow
const ArrowCss = css`
	position: absolute;
	left: 10px;
	bottom: 50%;
	transform: translateY(50%);
	background-color: rgba(255, 255, 255, 0.95);
	border-radius: 50%;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 3;
	// box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: #ffffff;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}
`;

// Styled component for the left arrow
const ArrowLeft = styled.div`
	${ArrowCss};
`;

// Styled component for the right arrow
const ArrowRight = styled.div`
	${ArrowCss};
	left: auto;
	right: 10px;
`;

// Styled component for the left arrow icon
const ArrowLeftIconStyled = styled(Icon)`
	font-size: 18px;
	color: #A0805A;
`;

// Styled component for the right arrow icon
const ArrowRightIconStyled = styled(Icon)`
	font-size: 18px;
	color: #A0805A;
`;

// Container component for mobile menu items
export const MobileItemsContainer: FC<MenuItemsContainerProps> = ({
	children,
	isLeftArrowVisible,
	isRightArrowVisible,
	onScrollChange,
	scrollLeft
}) => {
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	const ref = useRef<HTMLDivElement | null>(null);
	if (ref.current && scrollLeft != null) ref.current.scrollLeft = scrollLeft ?? 0;

	// Update visibility on scroll
	useEffect(() => {
		const handleScroll = () => {
			if (ref.current) {
				onScrollChange(ref.current.scrollLeft);
				const [showLeft, showRight] = getVisibleArrows(ref.current);
				setShowLeftArrow(showLeft);
				setShowRightArrow(showRight);
			}
		};

		// Initial visiblity
		handleScroll();

		const actualRef = ref.current;
		actualRef?.addEventListener('scroll', handleScroll);
		return () => actualRef?.removeEventListener('scroll', handleScroll);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MenuItemsWrapper ref={ref}>
			{showLeftArrow && isLeftArrowVisible && (
				<ArrowLeft>
					<ArrowLeftIconStyled>
						<ArrowLeftIcon />
					</ArrowLeftIconStyled>
				</ArrowLeft>
			)}

			{/* Content */}
			{children}

			{showRightArrow && isRightArrowVisible && (
				<ArrowRight>
					<ArrowRightIconStyled>
						<ArrowRightIcon />
					</ArrowRightIconStyled>
				</ArrowRight>
			)}
		</MenuItemsWrapper>
	);
};

// Component for each menu item
export const MenuItem: FC<MenuItemProps> = (props) => {
	return (
		<MobileItemContainer onClick={props.onClick} selected={props.selected}>
			{/* {props.description && props.description.length !== 0 && (
				<Tooltip optionDescription={props.description} $isMobile />
			)} */}
			<MenuItemCard selected={props.selected}>
				{props.imageUrl && (
					<MenuItemImage
						isRound={props.isRound}
						selected={props.selected}
						src={props.imageUrl}
						alt={props.label}
						loading="lazy"
					/>
				)}
				{!props.imageUrl && props.icon && (
					<MenuItemIcon selected={props.selected}>{props.icon}</MenuItemIcon>
				)}
				{props.images && (
					<MenuItemImagesWrapper selected={props.selected}>
						{[0, 0, 0, 0].map((_, index) => (
							<MenuItemImagesImageWrapper key={index}>
								{props.images!.length > index && (
									<MenuItemImagesImage
										isRound={props.isRound}
										selected={props.selected}
										src={props.images ? props.images[index] : noImage}
										alt={props.label}
										loading="lazy"
									/>
								)}
							</MenuItemImagesImageWrapper>
						))}
					</MenuItemImagesWrapper>
				)}
			</MenuItemCard>
			{!props.hideLabel && <MenuItemLabel selected={props.selected}>{props.label}</MenuItemLabel>}
		</MobileItemContainer>
	);
};