import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

@Injectable()
export class MilvusService implements OnModuleInit {
  private readonly logger = new Logger(MilvusService.name);
  public client: MilvusClient;
  public readonly COLLECTION_NAME = 'nest_owl_docs';

  onModuleInit() {
    this.client = new MilvusClient({ address: '127.0.0.1:19530' });
    this.logger.log('🦉  NestOwl 成功连接到 Milvus 向量数据库！');
  }

  //创建集合
  async createCollection(dimension: number) {
    const hasCollection = await this.client.hasCollection({
      collection_name: this.COLLECTION_NAME,
    });

    if (hasCollection.value) {
      this.logger.log(`集合 ${this.COLLECTION_NAME} 已存在，跳过创建。`);
      return;
    }

    //先建表
    await this.client.createCollection({
      collection_name: this.COLLECTION_NAME,
      fields: [
        { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
        { name: 'vector', data_type: DataType.FloatVector, dim: dimension },
        { name: 'content', data_type: DataType.VarChar, max_length: 2000 },
      ],
    });

    //再建索引
    await this.client.createIndex({
      collection_name: this.COLLECTION_NAME,
      field_name: 'vector',
      index_type: 'AUTOINDEX',
      metric_type: 'COSINE',
    });

    this.logger.log(`✅ 成功创建集合: ${this.COLLECTION_NAME}`);
  }

  async loadCollection() {
    try {
      // 检查集合是否已经加载，避免重复加载报错
      const loadState = await this.client.getLoadState({
        collection_name: this.COLLECTION_NAME, // 比如 'nest_owl_docs'
      });

      if (loadState.state === 'LoadStateNotLoad') {
        await this.client.loadCollection({
          collection_name: this.COLLECTION_NAME,
        });
        console.log(`集合 ${this.COLLECTION_NAME} 已成功加载到内存`);
      } else {
        console.log(`集合 ${this.COLLECTION_NAME} 已经是加载状态`);
      }
    } catch (error) {
      console.error('加载集合失败:', error);
      throw error;
    }
  }

  // 2. 插入数据
  async insertData(vector: number[], content: string) {
    const res = await this.client.insert({
      collection_name: this.COLLECTION_NAME,
      data: [
        {
          vector: vector,
          content: content,
        },
      ],
    });

    this.logger.log(`📥 数据已插入 Milvus, 插入数量: ${res.insert_cnt}`);
    return res;
  }

  //向量检索
  async search(vector: number[], limit: number = 3) {
    await this.loadCollection();

    const res = await this.client.search({
      collection_name: this.COLLECTION_NAME,
      data: [vector],
      limit: limit,
      output_fields: ['content'],
    });

    this.logger.log(`🔍 检索到 ${ res }`);
    // 把搜到的结果提取成纯字符串数组返回
    return res.results.map((item: any) => item.content);
  }
}
