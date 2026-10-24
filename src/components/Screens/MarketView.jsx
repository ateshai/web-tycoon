import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { MARKET_ITEMS } from '../../logic/constants'
import { formatNumber } from '../../logic/utils'

const MarketView = () => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState('sell')
  const [activeFeedback, setActiveFeedback] = useState({}) // { [itemId]: { text, type, id } }
  const [balancePulse, setBalancePulse] = useState(null) // 'gain' | 'spend' | null

  const { money, wood, stone, plank, sellResource, buyResource } = useGameStore(state => ({
    money: state.money || 0,
    wood: state.wood || 0,
    stone: state.stone || 0,
    plank: state.plank || 0,
    sellResource: state.sellResource,
    buyResource: state.buyResource
  }))

  const playerResources = {
    wood,
    stone,
    plank
  }

  const triggerFeedback = (itemId, text, type) => {
    const effectId = Date.now() + Math.random()
    setActiveFeedback(prev => ({
      ...prev,
      [itemId]: { text, type, id: effectId }
    }))
    setBalancePulse(type)

    setTimeout(() => {
      setActiveFeedback(prev => {
        if (prev[itemId]?.id === effectId) {
          const next = { ...prev }
          delete next[itemId]
          return next
        }
        return prev
      })
    }, 1200)

    setTimeout(() => {
      setBalancePulse(null)
    }, 600)
  }

  const handleSell = (item, amount) => {
    const itemName = t(`items.${item.id}.name`, item.name)
    const res = sellResource(item.id, amount, item.sellPrice, itemName)
    if (res?.success) {
      triggerFeedback(item.id, `+$${formatNumber(res.earnings)}`, 'gain')
    }
  }

  const handleBuy = (item, amount) => {
    const itemName = t(`items.${item.id}.name`, item.name)
    const res = buyResource(item.id, amount, item.buyPrice, itemName)
    if (res?.success) {
      triggerFeedback(item.id, `-$${formatNumber(res.cost)}`, 'spend')
    }
  }

  return (
    <div className="screen market-view">
      <div className="market-header">
        <div>
          <h1>{t('market.title')}</h1>
          <p className="market-subtitle">
            {t('market.subtitle')}
          </p>
        </div>
        <div className={`market-balance-pill ${balancePulse ? `pulse-${balancePulse}` : ''}`}>
          <span>💰 {t('market.cash')}: <strong>${formatNumber(money)}</strong></span>
        </div>
      </div>

      <div className="market-tabs">
        <Button
          variant={selectedTab === 'sell' ? 'primary' : 'secondary'}
          onClick={() => setSelectedTab('sell')}
        >
          {t('market.sellTab')}
        </Button>
        <Button
          variant={selectedTab === 'buy' ? 'primary' : 'secondary'}
          onClick={() => setSelectedTab('buy')}
        >
          {t('market.buyTab')}
        </Button>
      </div>

      <div className="market-content">
        {selectedTab === 'sell' ? (
          <div className="trade-section">
            <h2>{t('market.sellSectionTitle')}</h2>
            <div className="market-grid">
              {Object.values(MARKET_ITEMS).map(item => {
                const currentAmount = Math.floor(playerResources[item.id] || 0)
                const totalValue = currentAmount * item.sellPrice
                const feedback = activeFeedback[item.id]
                const itemName = t(`items.${item.id}.name`, item.name)
                const itemDescription = t(`items.${item.id}.description`, item.description)

                return (
                  <div
                    key={item.id}
                    className={`market-card ${feedback ? `card-flash-${feedback.type}` : ''}`}
                  >
                    {feedback && (
                      <div className={`floating-trade-feedback ${feedback.type}`}>
                        {feedback.text}
                      </div>
                    )}

                    <div className="market-card-top">
                      <span className="market-item-icon">{item.icon}</span>
                      <div>
                        <h3>{itemName}</h3>
                        <p className="item-description">{itemDescription}</p>
                      </div>
                    </div>

                    <div className="market-card-stats">
                      <div className="stat-row">
                        <span>{t('market.sellPrice')}:</span>
                        <strong className="text-success">${item.sellPrice} / {t('resources.units')}</strong>
                      </div>
                      <div className="stat-row">
                        <span>{t('market.inStorage')}:</span>
                        <strong>{formatNumber(currentAmount)} {t('resources.units')}</strong>
                      </div>
                      <div className="stat-row">
                        <span>{t('market.totalValue')}:</span>
                        <strong>${formatNumber(totalValue)}</strong>
                      </div>
                    </div>

                    <div className="market-card-actions">
                      <Button
                        onClick={() => handleSell(item, 1)}
                        disabled={currentAmount < 1}
                      >
                        {t('market.sell1', { price: item.sellPrice })}
                      </Button>
                      <Button
                        onClick={() => handleSell(item, 10)}
                        disabled={currentAmount < 10}
                      >
                        {t('market.sell10', { price: item.sellPrice * 10 })}
                      </Button>
                      <Button
                        onClick={() => handleSell(item, 50)}
                        disabled={currentAmount < 50}
                      >
                        {t('market.sell50', { price: item.sellPrice * 50 })}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleSell(item, currentAmount)}
                        disabled={currentAmount <= 0}
                      >
                        {t('market.sellAll', { value: formatNumber(totalValue) })}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="trade-section">
            <h2>{t('market.buySectionTitle')}</h2>
            <div className="market-grid">
              {Object.values(MARKET_ITEMS).map(item => {
                const currentStock = Math.floor(playerResources[item.id] || 0)
                const feedback = activeFeedback[item.id]
                const itemName = t(`items.${item.id}.name`, item.name)
                const itemDescription = t(`items.${item.id}.description`, item.description)

                return (
                  <div
                    key={item.id}
                    className={`market-card ${feedback ? `card-flash-${feedback.type}` : ''}`}
                  >
                    {feedback && (
                      <div className={`floating-trade-feedback ${feedback.type}`}>
                        {feedback.text}
                      </div>
                    )}

                    <div className="market-card-top">
                      <span className="market-item-icon">{item.icon}</span>
                      <div>
                        <h3>{itemName}</h3>
                        <p className="item-description">{itemDescription}</p>
                      </div>
                    </div>

                    <div className="market-card-stats">
                      <div className="stat-row">
                        <span>{t('market.buyPrice')}:</span>
                        <strong className="text-warning">${item.buyPrice} / {t('resources.units')}</strong>
                      </div>
                      <div className="stat-row">
                        <span>{t('market.currentStock')}:</span>
                        <strong>{formatNumber(currentStock)} {t('resources.units')}</strong>
                      </div>
                    </div>

                    <div className="market-card-actions">
                      <Button
                        onClick={() => handleBuy(item, 1)}
                        disabled={money < item.buyPrice}
                      >
                        {t('market.buy1', { price: item.buyPrice })}
                      </Button>
                      <Button
                        onClick={() => handleBuy(item, 10)}
                        disabled={money < item.buyPrice * 10}
                      >
                        {t('market.buy10', { price: item.buyPrice * 10 })}
                      </Button>
                      <Button
                        onClick={() => handleBuy(item, 50)}
                        disabled={money < item.buyPrice * 50}
                      >
                        {t('market.buy50', { price: item.buyPrice * 50 })}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketView