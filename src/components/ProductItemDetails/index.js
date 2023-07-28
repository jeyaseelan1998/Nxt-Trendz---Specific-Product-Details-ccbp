import { Component } from "react";
import Cookies from "js-cookie";
import { BsPlusSquare, BsDashSquare } from 'react-icons/bs'
import Loader from "react-loader-spinner";
import Header from '../Header'
import ProductCard from '../ProductCard'

import './index.css'

const apiStatusConstants = {
    initial: 'INITIAL',
    success: 'SUCCESS',
    failure: 'FAILURE',
    inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
    state = {
        apiStatus: apiStatusConstants.initial,
        productDetails: {},
        quantity: 1
    }

    componentDidMount() {
        this.getProductDetails()
    }

    getProductDetails = async () => {
        const { match: { params: { id } } } = this.props
        this.setState({ apiStatus: apiStatusConstants.inProgress })
        const jwtToken = Cookies.get('jwt_token')
        const apiUrl = `https://apis.ccbp.in/products/${id}`
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        }
        const response = await fetch(apiUrl, options)
        if (response.ok) {
            const data = await response.json()
            const modifiedSimilarProducts = products =>
                products.map(product => ({
                    title: product.title,
                    brand: product.brand,
                    price: product.price,
                    id: product.id,
                    imageUrl: product.image_url,
                    rating: product.rating,
                }))
            const modifiedData = {
                availability: data.availability,
                brand: data.brand,
                description: data.description,
                id: data.id,
                imageUrl: data.image_url,
                price: data.price,
                rating: data.rating,
                title: data.title,
                totalReviews: data.total_reviews,
                similarProducts: modifiedSimilarProducts(data.similar_products)
            }
            this.setState({ productDetails: modifiedData, apiStatus: apiStatusConstants.success })
        } else {
            this.setState({ apiStatus: apiStatusConstants.failure })
        }
    }

    onIncreaseQuatity = () =>
        this.setState(prevState => ({ quantity: prevState.quantity + 1 }))

    onDecreaseQuatity = () => {
        const { quantity } = this.state
        if (quantity > 1) {
            this.setState(prevState => ({ quantity: prevState.quantity - 1 }))
        }
    }

    onContinueShopping = () => {
        const {history} = this.props
        history.push('/products')
    }

    renderFailureView = () => (
        <div className="failure-view-container">
            <img src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png" alt="error view" />
            <p>Product Not Found</p>
            <button onClick={this.onContinueShopping} type="button" className="add-to-cart-button">Continue Shopping</button>
        </div>
    )

    renderLoadingView = () => (
        <div data-testid="loader" className="loader">
            <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
        </div>
    )

    renderSimilarProducts = () => {
        const { productDetails: { similarProducts } } = this.state
        return (
            <ul className="similar-products-list">
                {
                    similarProducts.map(product => <ProductCard key={product.id} productData={product} alt={`similar product ${product.title}`} />)
                }
            </ul>
        )
    }

    renderPlusMinusButtons = () => {
        const { quantity } = this.state
        return (
            <div className="controller-container">
                <button type="button" data-testid="minus" onClick={this.onDecreaseQuatity}><BsDashSquare className="plus-minus-icon" /></button>
                <p className="quantity">{quantity}</p>
                <button type="button" data-testid="plus" onClick={this.onIncreaseQuatity}><BsPlusSquare className="plus-minus-icon" /></button>
            </div>
        )
    }

    renderSuccessView = () => {
        const { productDetails } = this.state
        const { availability, brand, description, imageUrl, price, rating, title, totalReviews } = productDetails
        return (
            <>
                <div className="product-details-card">
                    <img src={imageUrl} alt="product" className="product-details-card-image" />
                    <div className="product-details-card-info-container">
                        <h1 className="product-details-card-title">{title}</h1>
                        <p className="product-details-card-price">Rs {price}/-</p>
                        <div className="rating-review-container">
                            <div className="rating-container">
                                <p>{rating}</p>
                                <img className="star-icon" src="https://assets.ccbp.in/frontend/react-js/star-img.png" alt="star" />
                            </div>
                            <p>{totalReviews} Reviews</p>
                        </div>
                        <p className="product-details-card-description">{description}</p>
                        <div className="product-details-card-sub-container">
                            <p className="product-details-card-sub-heading">Available:</p>
                            <p className="product-details-card-description">{availability}</p>
                        </div>
                        <div className="product-details-card-sub-container">
                            <p className="product-details-card-sub-heading">Brand:</p>
                            <p className="product-details-card-description">{brand}</p>
                        </div>
                        <hr className="separator" />
                        {this.renderPlusMinusButtons()}
                        <button type="button" className="add-to-cart-button">ADD TO CART</button>
                    </div>
                </div>
                <h1 className="similar-products-heading">Similar Products</h1>
                {this.renderSimilarProducts()}
            </>
        )
    }

    renderProductDetailsView = () => {
        const { apiStatus } = this.state

        switch (apiStatus) {
            case apiStatusConstants.inProgress:
                return this.renderLoadingView()
            case apiStatusConstants.success:
                return this.renderSuccessView()
            case apiStatusConstants.failure:
                return this.renderFailureView()
            default:
                return null
        }
    }

    render() {
        return (
            <>
                <Header />
                <div className="product-details-container">
                    {this.renderProductDetailsView()}
                </div>
            </>
        )
    }
}

export default ProductItemDetails