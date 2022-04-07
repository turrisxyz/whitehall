class AddAuthBypassIdToEdition < ActiveRecord::Migration[6.1]
  def change
    add_column :editions, :auth_bypass_id, :string
  end
end
