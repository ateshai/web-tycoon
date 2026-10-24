import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { MARKET_ITEMS } from '../../logic/constants'
import { formatNumber } from '../../logic/utils'

import styles from './MarketView.module.css'

const MarketView = () => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState('sell')
  const [activeFeedback, setActiveFeedback] = useState({}) // { [itemId]: { text, type, id } }
  const [balancePulse, setBalancePulse] = useState(null) // 'gain' | 'spend' | null

  const { money, wood, stone, plank, food, water, sellResource, buyResource } = useGameStore(state => ({
    money: state.money || 0,
    wood: state.wood || 0,
    stone: state.stone || 0,
    plank: state.plank || 0,
    food: state.food || 0,
    water: state.water || 0,
    sellResource: state.sellResource,
    buyResource: state.buyResource
  }))

  const playerResources = {
    wood,
    stone,
    plank,
    food,
    water
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
    <div className={`screen ${styles.marketView}`}>
      <div className={styles.marketHeader}>
        <div>
          <h1>{t('market.title')}</h1>
          <p className={styles.marketSubtitle}>
            {t('market.subtitle')}
          </p>
        </div>
        <div className={`${styles.marketBalancePill} ${balancePulse === 'gain' ? styles.pulseGain : balancePulse === 'spend' ? styles.pulseSpend : ''}`}>
          <span>💰 {t('market.cash')}: <strong>${formatNumber(money)}</strong></span>
        </div>
      </div>

      <div className={styles.marketTabs}>
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

      <div className={styles.marketContent}>
        {selectedTab === 'sell' ? (
          <div className={styles.tradeSection}>
            <h2>{t('market.sellSectionTitle')}</h2>
            <div className={styles.marketGrid}>
              {Object.values(MARKET_ITEMS).map(item => {
                const currentAmount = Math.floor(playerResources[item.id] || 0)
                const totalValue = currentAmount * item.sellPrice
                const feedback = activeFeedback[item.id]
                const itemName = t(`items.${item.id}.name`, item.name)
                const itemDescription = t(`items.${item.id}.description`, item.description)

                const flashClass = feedback?.type === 'gain' ? styles.cardFlashGain : feedback?.type === 'spend' ? styles.cardFlashSpend : ''

                return (
                  <div
                    key={item.id}
                    className={`${styles.marketCard} ${flashClass}`}
                  >
                    {feedback && (
                      <div className={`${styles.floatingTradeFeedback} ${styles[feedback.type] || ''}`}>
                        {feedback.text}
                      </div>
                    )}

                    <div className={styles.marketCardTop}>
                      <span className={styles.marketItemIcon}>{item.icon}</span>
                      <div>
                        <h3>{itemName}</h3>
                        <p className={styles.itemDescription}>{itemDescription}</p>
                      </div>
                    </div>

                    <div className={styles.marketCardStats}>
                      <div className={styles.statRow}>
                        <span>{t('market.sellPrice')}:</span>
                        <strong className="text-success">${item.sellPrice} / {t('resources.units')}</strong>
                      </div>
                      <div className={styles.statRow}>
                        <span>{t('market.inStorage')}:</span>
                        <strong>{formatNumber(currentAmount)} {t('resources.units')}</strong>
                      </div>
                      <div className={styles.statRow}>
                        <span>{t('market.totalValue')}:</span>
                        <strong>${formatNumber(totalValue)}</strong>
                      </div>
                    </div>

                    <div className={styles.marketCardActions}>
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
          <div className={styles.tradeSection}>
            <h2>{t('market.buySectionTitle')}</h2>
            <div className={styles.marketGrid}>
              {Object.values(MARKET_ITEMS).map(item => {
                const currentStock = Math.floor(playerResources[item.id] || 0)
                const feedback = activeFeedback[item.id]
                const itemName = t(`items.${item.id}.name`, item.name)
                const itemDescription = t(`items.${item.id}.description`, item.description)

                const flashClass = feedback?.type === 'gain' ? styles.cardFlashGain : feedback?.type === 'spend' ? styles.cardFlashSpend : ''

                return (
                  <div
                    key={item.id}
                    className={`${styles.marketCard} ${flashClass}`}
                  >
                    {feedback && (
                      <div className={`${styles.floatingTradeFeedback} ${styles[feedback.type] || ''}`}>
                        {feedback.text}
                      </div>
                    )}

                    <div className={styles.marketCardTop}>
                      <span className={styles.marketItemIcon}>{item.icon}</span>
                      <div>
                        <h3>{itemName}</h3>
                        <p className={styles.itemDescription}>{itemDescription}</p>
                      </div>
                    </div>

                    <div className={styles.marketCardStats}>
                      <div className={styles.statRow}>
                        <span>{t('market.buyPrice')}:</span>
                        <strong className="text-warning">${item.buyPrice} / {t('resources.units')}</strong>
                      </div>
                      <div className={styles.statRow}>
                        <span>{t('market.currentStock')}:</span>
                        <strong>{formatNumber(currentStock)} {t('resources.units')}</strong>
                      </div>
                    </div>

                    <div className={styles.marketCardActions}>
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